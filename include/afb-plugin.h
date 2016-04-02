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

struct afb_req;

/* Plugin Type */
enum  AFB_pluginE
{
	AFB_PLUGIN_JSON = 123456789,
/*	AFB_PLUGIN_JSCRIPT = 987654321, */
	AFB_PLUGIN_RAW = 987123546
};

/* Enum for Session/Token/Authentication middleware */
enum AFB_sessionE
{
	AFB_SESSION_NONE,
	AFB_SESSION_CREATE,
	AFB_SESSION_CLOSE,
	AFB_SESSION_RENEW,
	AFB_SESSION_CHECK
};

/* API definition */
struct AFB_restapi
{
	const char *name;
	enum AFB_sessionE session;
	void (*callback)(struct afb_req req);
	const char *info;
};

/* Plugin definition */
struct AFB_plugin
{
	enum AFB_pluginE type;  
	const char *info;
	const char *prefix;
	const struct AFB_restapi *apis;
	void (*freeCtxCB)(void*);  // callback to free application context [null for standard free]
};

typedef enum AFB_pluginE AFB_pluginE;
typedef enum AFB_sessionE AFB_sessionE;
typedef void (*AFB_apiCB)(struct afb_req);
typedef void (*AFB_freeCtxCB)(void*);
typedef struct AFB_restapi AFB_restapi;
typedef struct AFB_plugin AFB_plugin;

extern const struct AFB_plugin *pluginRegister ();
