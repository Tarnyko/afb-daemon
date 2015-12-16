(function() {
'use strict';

// list all rependencies within the page + controler if needed
angular.module('SampleModule', ['SubmitButton','UploadFile'])

  .controller('SampleController', function ($http) {
        var self = this; // I hate JavaScript
        this.status='muted-off';

        console.log ("sample controller");

        this.MuteOn = function() {
           console.log ("Muted");
            // send AJAX request to server
            var handler = $http.post('/api/dbus/ping', {type:'mute', action: "on"});
            
            handler.success(function(response, errcode, headers, config) {
                self.status = 'muted-on';                
            });

            handler.error(function(status, errcode, headers) {
                console.log ("Oops /api/dbus/pring err=" + errcode);
                self.status = 'muted-error';                
            });
        };
        
        this.MuteOff = function() {
           console.log ("UnMuted"); 
            // send AJAX request to server
            var handler = $http.post('/api/dbus/ping', {type:'mute', action: "off"});
            
            handler.success(function(response, errcode, headers, config) {
               self.status = 'muted-off';                
            });

            handler.error(function(status, errcode, headers) {
                console.log ("Oops /api/dbus/ping err=" + errcode);
                self.status = 'muted-error';                
            });
            
        };

 
   });

console.log ("SampleControler Loaded");
})(); 