/*
 * Copyright 2016 IoT.bzh
 * Author: José Bollo <jose.bollo@iot.bzh>
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

#pragma once

struct json_object;

struct afb_arg {
	const char *name;
	const char *value;
	const char *path;
};

struct afb_req_itf {
	struct json_object *(*json)(void *req_closure);
	struct afb_arg (*get)(void *req_closure, const char *name);
	void (*success)(void *req_closure, struct json_object *obj, const char *info);
	void (*fail)(void *req_closure, const char *status, const char *info);
	const char *(*raw)(void *req_closure, size_t *size);
	void (*send)(void *req_closure, const char *buffer, size_t size);
	void *(*context_get)(void *ctx_closure);
	void (*context_set)(void *ctx_closure, void *value, void (*free_value)(void*));
	int (*session_create)(void *req_closure);
	int (*session_check)(void *req_closure, int refresh);
	void (*session_close)(void *req_closure);
};

struct afb_req {
	const struct afb_req_itf *itf;
	void *req_closure;
	void *ctx_closure;
};

static inline struct afb_arg afb_req_get(struct afb_req req, const char *name)
{
	return req.itf->get(req.req_closure, name);
}

static inline const char *afb_req_value(struct afb_req req, const char *name)
{
	return afb_req_get(req, name).value;
}

static inline const char *afb_req_path(struct afb_req req, const char *name)
{
	return afb_req_get(req, name).path;
}

static inline struct json_object *afb_req_json(struct afb_req req)
{
	return req.itf->json(req.req_closure);
}

static inline void afb_req_success(struct afb_req req, struct json_object *obj, const char *info)
{
	req.itf->success(req.req_closure, obj, info);
}

static inline void afb_req_fail(struct afb_req req, const char *status, const char *info)
{
	req.itf->fail(req.req_closure, status, info);
}

static inline const char *afb_req_raw(struct afb_req req, size_t *size)
{
	return req.itf->raw(req.req_closure, size);
}

static inline void afb_req_send(struct afb_req req, const char *buffer, size_t size)
{
	req.itf->send(req.req_closure, buffer, size);
}

static inline void *afb_req_context_get(struct afb_req req)
{
	return req.itf->context_get(req.ctx_closure);
}

static inline void afb_req_context_set(struct afb_req req, void *value, void (*free_value)(void*))
{
	return req.itf->context_set(req.ctx_closure, value, free_value);
}

static inline void afb_req_context_clear(struct afb_req req)
{
	afb_req_context_set(req, NULL, NULL);
}

static inline int afb_req_session_create(struct afb_req req)
{
	int result = req.itf->session_create(req.req_closure);
	if (!result)
		afb_req_fail(req, "fail", "Can't create the session");
	return result;
}

static inline int afb_req_session_check(struct afb_req req, int refresh)
{
	int result = req.itf->session_check(req.req_closure, refresh);
	if (!result)
		afb_req_fail(req, "fail", "Token chek failed for the session");
	return result;
}

static inline void afb_req_session_close(struct afb_req req)
{
	req.itf->session_close(req.req_closure);
}

#include <stdlib.h>

static inline struct afb_req *afb_req_store(struct afb_req req)
{
	struct afb_req *result = malloc(sizeof *result);
	if (result != NULL)
		*result = req;
	return result;
}

static inline struct afb_req afb_req_unstore(struct afb_req *req)
{
	struct afb_req result = *req;
	free(req);
	return result;
}

#if !defined(_GNU_SOURCE)
# error "_GNU_SOURCE must be defined for using vasprintf"
#endif

#include <stdarg.h>
#include <stdio.h>

static inline void afb_req_fail_v(struct afb_req req, const char *status, const char *info, va_list args)
{
	char *message;
	if (info == NULL || vasprintf(&message, info, args) < 0)
		message = NULL;
	afb_req_fail(req, status, message);
	free(message);
}

static inline void afb_req_fail_f(struct afb_req req, const char *status, const char *info, ...)
{
	va_list args;
	va_start(args, info);
	afb_req_fail_v(req, status, info, args);
	va_end(args);
}

static inline void afb_req_success_v(struct afb_req req, struct json_object *obj, const char *info, va_list args)
{
	char *message;
	if (info == NULL || vasprintf(&message, info, args) < 0)
		message = NULL;
	afb_req_success(req, obj, message);
	free(message);
}

static inline void afb_req_success_f(struct afb_req req, struct json_object *obj, const char *info, ...)
{
	va_list args;
	va_start(args, info);
	afb_req_success_v(req, obj, info, args);
	va_end(args);
}

