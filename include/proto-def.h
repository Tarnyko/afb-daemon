/*
   alsajson-gw -- provide a REST/HTTP interface to ALSA-Mixer

   Copyright (C) 2015, Fulup Ar Foll

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

*/

// helper-api
PUBLIC json_object* getPingTest(AFB_request *request);
PUBLIC const char* getQueryValue (const AFB_request * request, const char *name);
PUBLIC int getQueryAll(AFB_request * request, char *query, size_t len);
PUBLIC AFB_PostHandle* getPostHandle (AFB_request *request);
PUBLIC json_object* getPostFile (AFB_request *request, AFB_PostItem *item, char* destination) ;
PUBLIC AFB_PostCtx* getPostContext (AFB_request *request);
PUBLIC char* getPostPath (AFB_request *request);

// rest-api
PUBLIC void endPostRequest(AFB_PostHandle *posthandle); 
PUBLIC int doRestApi(struct MHD_Connection *connection, AFB_session *session, const char* url, const char *method
    , const char *upload_data, size_t *upload_data_size, void **con_cls);

void initPlugins (AFB_session *session);

typedef AFB_plugin* (*AFB_pluginCB)();
PUBLIC  AFB_plugin* pluginRegister ();

// Session handling
PUBLIC AFB_error sessionCheckdir     (AFB_session *session);
PUBLIC json_object *sessionList      (AFB_session *session, AFB_request *request);
PUBLIC json_object *sessionToDisk    (AFB_session *session, AFB_request *request, char *name,json_object *jsonSession);
PUBLIC json_object *sessionFromDisk  (AFB_session *session, AFB_request *request, char *name);

PUBLIC AFB_error ctxTokenRefresh (AFB_clientCtx *clientCtx, AFB_request *request);
PUBLIC AFB_error ctxTokenCreate (AFB_clientCtx *clientCtx, AFB_request *request);
PUBLIC AFB_error ctxTokenCheck (AFB_clientCtx *clientCtx, AFB_request *request);
PUBLIC AFB_error ctxTokenReset (AFB_clientCtx *clientCtx, AFB_request *request);
PUBLIC AFB_clientCtx *ctxClientGet (AFB_request *request, int idx);
PUBLIC void      ctxStoreInit (int);



// Httpd server
PUBLIC AFB_error httpdStart          (AFB_session *session);
PUBLIC AFB_error httpdLoop           (AFB_session *session);
PUBLIC void  httpdStop               (AFB_session *session);


// config management
PUBLIC char *configTime        (void);
PUBLIC AFB_session *configInit (void);
PUBLIC json_object *jsonNewMessage (AFB_error level, char* format, ...);
PUBLIC json_object *jsonNewStatus (AFB_error level);
PUBLIC json_object *jsonNewjtype (void);
PUBLIC json_object *jsonNewMessage (AFB_error level, char* format, ...);
PUBLIC void jsonDumpObject (json_object * jObject);
PUBLIC AFB_error configLoadFile (AFB_session * session, AFB_config *cliconfig);
PUBLIC void configStoreFile (AFB_session * session);

