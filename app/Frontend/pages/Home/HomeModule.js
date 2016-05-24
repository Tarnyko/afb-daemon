(function() {
'use strict';

// WARNING: make sure than app/frontend/services/AppConfig.js match your server

// list all rependencies within the page + controler if needed
angular.module('HomeModule', ['SubmitButton', 'TokenRefresh','ModalNotification'])

  .controller('HomeController', function (AppCall, Notification) {
        var scope = this; // I hate JavaScript
        scope.uuid   ="none";
        scope.token  ="none";
        scope.session="none";
        scope.status ="err-no";

        console.log ("Home Controller");
        
        scope.ProcessResponse= function(data, errcode, headers, config) {
            
            if (data.request.status !== "success") {
                Notification.error ({message: "Invalid API call:" + data.request.info , delay: 5000});
                return;
            }
            
            // Update UI response global display zone
            scope.status   = data.request.status;
            scope.errcode  = errcode;
            scope.request  = data.request;
            scope.response = data.response;
            
            switch (data.request.reqid) {
                case 'open':
                case 'reset':
                    scope.APIreset  ='';
                    scope.APIcreate ='';
                    scope.APIrefresh='';
                    scope.APIcheck  ='';
                    break;
                    
                case 'refresh':
                case 'check':
                    break;
                    
                default:
                    Notification.error ({message: "Invalid RequestID:" + data.request.reqid , delay: 5000});
                    return;
            } 

            scope[reqid]="success";            
            console.log ("OK: "+ JSON.stringify(data));
        };
        
        scope.ProcessError= function(data, errcode, headers, config) {
            Notification.error ({message: "Invalid API:" + data.request.reqid , delay: 5000});
            scope.status   = "err-fx";
            scope.errcode  = errcode;
            scope.request  = data.request;
            scope.response = "";            
            console.log ("FX: "+ JSON.stringify(data));
        };

        scope.OpenSession = function() {
            console.log ("OpenSession");
            AppCall.get ("token", "create", {reqid:"open"}, scope.ProcessResponse, scope.InvalidApiCall);
        };        

        scope.CheckSession = function() {
            console.log ("CloseSession");
           
            var postdata= {/* any json your application may need */};
            var handler = $http.post(AppConfig.session.check + '?token='+AppConfig.session.token +'?idreq=open', postdata);
            
            handler.success(scope.ProcessResponse);
            handler.error(scope.ProcessError);
        };
        
        scope.RefreshSession = function() {
            console.log ("RefreshSession");
            var postdata= {/* any json your application may need */};
            var handler = $http.post(AppConfig.session.refresh + '?token='+AppConfig.session.token, postdata);
            
            handler.success(scope.ProcessResponse);
            handler.error(scope.ProcessError);
        };
        
        scope.ResetSession = function() {
            console.log ("ResetSession");
            var postdata= {/* any json your application may need */};
            var handler = $http.post(AppConfig.session.reset + '?token='+AppConfig.session.token, postdata);
            
            handler.success(scope.ProcessResponse);
            handler.error(scope.ProcessError);
        };
        
   });

console.log ("SampleControler Loaded");
})(); 