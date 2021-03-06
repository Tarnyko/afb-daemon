/*
 * Copyright (C) 2016 "IoT.bzh"
 * Author José Bollo <jose.bollo@iot.bzh>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#define _GNU_SOURCE
#define NO_PLUGIN_VERBOSE_MACRO

#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <dirent.h>
#include <dlfcn.h>
#include <unistd.h>
#include <limits.h>
#include <sys/types.h>
#include <sys/stat.h>

#include <afb/afb-plugin.h>
#include <afb/afb-req-itf.h>

#include "session.h"
#include "afb-common.h"
#include "afb-context.h"
#include "afb-apis.h"
#include "afb-api-so.h"
#include "afb-sig-handler.h"
#include "verbose.h"

/*
 * Description of a plugin
 */
struct api_so_desc {
	struct AFB_plugin *plugin;	/* descriptor */
	size_t apilength;		/* length of the API name */
	void *handle;			/* context of dlopen */
	struct AFB_interface interface;	/* interface for the plugin */
};

static int api_timeout = 15;

static const char plugin_register_function_v1[] = "pluginAfbV1Register";

static int afb_api_so_event_broadcast(struct api_so_desc *desc, const char *name, struct json_object *object)
{
	size_t length;
	char *event;

	assert(desc->plugin != NULL);
	length = strlen(name);
	event = alloca(length + 2 + desc->apilength);
	memcpy(event, desc->plugin->v1.prefix, desc->apilength);
	event[desc->apilength] = '/';
	memcpy(event + desc->apilength + 1, name, length + 1);
	return ctxClientEventSend(NULL, event, object);
}

static void afb_api_so_vverbose(struct api_so_desc *desc, int level, const char *file, int line, const char *fmt, va_list args)
{
	char *p;

	if (vasprintf(&p, fmt, args) < 0)
		vverbose(level, file, line, fmt, args);
	else {
		verbose(level, file, line, "%s {plugin %s}", p, desc->plugin->v1.prefix);
		free(p);
	}
}

static const struct afb_daemon_itf daemon_itf = {
	.event_broadcast = (void*)afb_api_so_event_broadcast,
	.get_event_loop = (void*)afb_common_get_event_loop,
	.get_user_bus = (void*)afb_common_get_user_bus,
	.get_system_bus = (void*)afb_common_get_system_bus,
	.vverbose = (void*)afb_api_so_vverbose
};

struct monitoring {
	struct afb_req req;
	void (*action)(struct afb_req);
};

static void monitored_call(int signum, struct monitoring *data)
{
	if (signum != 0)
		afb_req_fail_f(data->req, "aborted", "signal %s(%d) caught", strsignal(signum), signum);
	else
		data->action(data->req);
}

static void call_check(struct afb_req req, struct afb_context *context, const struct AFB_verb_desc_v1 *verb)
{
	struct monitoring data;

	int stag = (int)verb->session;

	if ((stag & (AFB_SESSION_CREATE|AFB_SESSION_CLOSE|AFB_SESSION_RENEW|AFB_SESSION_CHECK|AFB_SESSION_LOA_EQ)) != 0) {
		if (!afb_context_check(context)) {
			afb_context_close(context);
			afb_req_fail(req, "failed", "invalid token's identity");
			return;
		}	
	}

	if ((stag & AFB_SESSION_CREATE) != 0) {
		if (afb_context_check_loa(context, 1)) {
			afb_req_fail(req, "failed", "invalid creation state");
			return;
		}
		afb_context_change_loa(context, 1);
		afb_context_refresh(context);
	}
	
	if ((stag & (AFB_SESSION_CREATE | AFB_SESSION_RENEW)) != 0)
		afb_context_refresh(context);

	if ((stag & AFB_SESSION_CLOSE) != 0) {
		afb_context_change_loa(context, 0);
		afb_context_close(context);
	}

	if ((stag & AFB_SESSION_LOA_GE) != 0) {
		int loa = (stag >> AFB_SESSION_LOA_SHIFT) & AFB_SESSION_LOA_MASK;
		if (!afb_context_check_loa(context, loa)) {
			afb_req_fail(req, "failed", "invalid LOA");
			return;
		}
	}

	if ((stag & AFB_SESSION_LOA_LE) != 0) {
		int loa = (stag >> AFB_SESSION_LOA_SHIFT) & AFB_SESSION_LOA_MASK;
		if (afb_context_check_loa(context, loa + 1)) {
			afb_req_fail(req, "failed", "invalid LOA");
			return;
		}
	}

	data.req = req;
	data.action = verb->callback;
	afb_sig_monitor((void*)monitored_call, &data, api_timeout);
}

static void call(struct api_so_desc *desc, struct afb_req req, struct afb_context *context, const char *verb, size_t lenverb)
{
	const struct AFB_verb_desc_v1 *v;

	v = desc->plugin->v1.verbs;
	while (v->name && (strncasecmp(v->name, verb, lenverb) || v->name[lenverb]))
		v++;
	if (v->name)
		call_check(req, context, v);
	else
		afb_req_fail_f(req, "unknown-verb", "verb %.*s unknown within api %s", (int)lenverb, verb, desc->plugin->v1.prefix);
}

int afb_api_so_add_plugin(const char *path)
{
	int rc;
	void *handle;
	struct api_so_desc *desc;
	struct AFB_plugin *(*pluginAfbV1RegisterFct) (const struct AFB_interface *interface);

	// This is a loadable library let's check if it's a plugin
	rc = 0;
	handle = dlopen(path, RTLD_NOW | RTLD_LOCAL);
	if (handle == NULL) {
		ERROR("plugin [%s] not loadable", path);
		goto error;
	}

	/* retrieves the register function */
	pluginAfbV1RegisterFct = dlsym(handle, plugin_register_function_v1);
	if (!pluginAfbV1RegisterFct) {
		ERROR("plugin [%s] is not an AFB plugin", path);
		goto error2;
	}
	INFO("plugin [%s] is a valid AFB plugin", path);
	rc = -1;

	/* allocates the description */
	desc = calloc(1, sizeof *desc);
	if (desc == NULL) {
		ERROR("out of memory");
		goto error2;
	}
	desc->handle = handle;

	/* init the interface */
	desc->interface.verbosity = verbosity;
	desc->interface.mode = AFB_MODE_LOCAL;
	desc->interface.daemon.itf = &daemon_itf;
	desc->interface.daemon.closure = desc;

	/* init the plugin */
	NOTICE("plugin [%s] calling registering function %s", path, plugin_register_function_v1);
	desc->plugin = pluginAfbV1RegisterFct(&desc->interface);
	if (desc->plugin == NULL) {
		ERROR("plugin [%s] register function failed. continuing...", path);
		goto error3;
	}

	/* check the returned structure */
	if (desc->plugin->type != AFB_PLUGIN_VERSION_1) {
		ERROR("plugin [%s] invalid type %d...", path, desc->plugin->type);
		goto error3;
	}
	if (desc->plugin->v1.prefix == NULL || *desc->plugin->v1.prefix == 0) {
		ERROR("plugin [%s] bad prefix...", path);
		goto error3;
	}
	if (!afb_apis_is_valid_api_name(desc->plugin->v1.prefix)) {
		ERROR("plugin [%s] invalid prefix...", path);
		goto error3;
	}
	if (desc->plugin->v1.info == NULL || *desc->plugin->v1.info == 0) {
		ERROR("plugin [%s] bad description...", path);
		goto error3;
	}
	if (desc->plugin->v1.verbs == NULL) {
		ERROR("plugin [%s] no APIs...", path);
		goto error3;
	}

	/* records the plugin */
	desc->apilength = strlen(desc->plugin->v1.prefix);
	if (afb_apis_add(desc->plugin->v1.prefix, (struct afb_api){
			.closure = desc,
			.call = (void*)call}) < 0) {
		ERROR("plugin [%s] can't be registered...", path);
		goto error3;
	}
	NOTICE("plugin %s loaded with API prefix %s", path, desc->plugin->v1.prefix);
	return 0;

error3:
	free(desc);
error2:
	dlclose(handle);
error:
	return rc;
}

static int adddirs(char path[PATH_MAX], size_t end)
{
	DIR *dir;
	struct dirent ent, *result;
	size_t len;

	/* open the DIR now */
	dir = opendir(path);
	if (dir == NULL) {
		ERROR("can't scan plugin directory %s, %m", path);
		return -1;
	}
	INFO("Scanning dir=[%s] for plugins", path);

	/* scan each entry */
	if (end)
		path[end++] = '/';
	for (;;) {
		readdir_r(dir, &ent, &result);
		if (result == NULL)
			break;

		len = strlen(ent.d_name);
		if (len + end >= PATH_MAX) {
			ERROR("path too long while scanning plugins for %s", ent.d_name);
			continue;
		}
		memcpy(&path[end], ent.d_name, len+1);
		if (ent.d_type == DT_DIR) {
			/* case of directories */
			if (ent.d_name[0] == '.') {
				if (len == 1)
					continue;
				if (ent.d_name[1] == '.' && len == 2)
					continue;
			}
			adddirs(path, end+len);;
		} else if (ent.d_type == DT_REG) {
			/* case of files */
			if (!strstr(ent.d_name, ".so"))
				continue;
			if (afb_api_so_add_plugin(path) < 0)
				return -1;
		}
	}
	closedir(dir);
	return 0;
}

int afb_api_so_add_directory(const char *path)
{
	size_t length;
	char buffer[PATH_MAX];

	length = strlen(path);
	if (length >= sizeof(buffer)) {
		ERROR("path too long %lu [%.99s...]", (unsigned long)length, path);
		return -1;
	}

	memcpy(buffer, path, length + 1);
	return adddirs(buffer, length);
}

int afb_api_so_add_path(const char *path)
{
	struct stat st;
	int rc;

	rc = stat(path, &st);
	if (rc < 0)
		ERROR("Invalid plugin path [%s]: %m", path);
	else if (S_ISDIR(st.st_mode))
		rc = afb_api_so_add_directory(path);
	else if (strstr(path, ".so"))
		rc = afb_api_so_add_plugin(path);
	else
		INFO("not a plugin [%s], skipped", path);
	return rc;
}

int afb_api_so_add_pathset(const char *pathset)
{
	static char sep[] = ":";
	char *ps, *p;

	ps = strdupa(pathset);
	for (;;) {
		p = strsep(&ps, sep);
		if (!p)
			return 0;
		if (afb_api_so_add_path(p) < 0)
			return -1;
	}
}

