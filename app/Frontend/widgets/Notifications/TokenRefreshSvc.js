/*
 alsa-gateway -- provide a REST/HTTP interface to ALSA-Mixer

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
 along with scope program; if not, write to the Free Software
 Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

 References:

 */

(function () {
    'use strict';

    var template =
          '<div class="afb-monitor" ng-click="getping()">' +
         '<span class="afb-refresh-token"  >afb://{{hostname}}:{{httpdport}}</span>' +
         '<i class="{{icon}}"></i>' +
         '</div>';


// scope module is load statically before any route is cativated
angular.module('TokenRefresh', ['ConfigApp', 'ModalNotification'])

    .directive ('tokenRefresh', function($timeout, $http, $location, Notification, ConfigApp) {

    function mymethods(scope, elem, attrs) {
        scope.status=undefined; // neither thu neither false
        
    
        scope.online = function () {
            elem.addClass    ("online");
            elem.removeClass ("offline");
        };

        scope.offline = function(){
            elem.addClass    ("offline");
            elem.removeClass ("online");
        };
        
        scope.onerror = function(data, errcode, headers) {
            if (scope.status !== false)  {
                Notification.warning ({message: "AppFramework Binder Lost", delay: 5000});
                scope.offline();
            }
            scope.status = 0;
        };
        
        scope.onsuccess = function(data, errcode, headers, config) {
            if (scope.status !== true)  {
                if (data.request.token) ConfigApp.session.token = data.request.token;
                if (data.request.uuid)  ConfigApp.session.uuid  = data.request.uuid;
                if (data.request.timeout)  ConfigApp.session.timeout  = data.request.timeout;

                Notification.success ({message: "AppFramework Binder Back to Live", delay: 3000});
                scope.online();
            }
            scope.status = 1;
        };

        // Check Binder status
        scope.getping = function() {

            var handler = $http.post(ConfigApp.session.ping+'?token='+ ConfigApp.session.token);
            
            // process success and error
            handler.success(scope.onsuccess);
            handler.error(scope.onerror);

            // restart a new timer for next ping
            $timeout (scope.getping, ConfigApp.session.pingrate*1000);
        };
        
        // Check Binder status
        scope.refresh = function() {
            var handler = $http.post(ConfigApp.session.refresh+'?token='+ ConfigApp.session.token);
            
            // process success and error
            handler.success(scope.onsuccess);
            handler.error(scope.onerror);
            // restart a new timer for next refresh to 1/4 of timeout session
            $timeout (scope.refresh, ConfigApp.session.timeout *250);
        };
        
        // Initial connection
        scope.tkcreate = function() {
            var handler = $http.post(ConfigApp.session.create+'?token='+ ConfigApp.session.initial);
            
            // process success and error
            handler.success(scope.onsuccess);
            handler.error(scope.onerror);
        };
 
        scope.icon      = attrs.icon   || "fi-lightbulb";
        scope.hostname  = $location.host();
        scope.httpdport = $location.port();
        scope.autolog   = JSON.parse(attrs.autolog || false);
        
        if (scope.autolog) scope.tkcreate();

        // Init ping and refresh process
        $timeout (scope.getping, ConfigApp.session.pingrate*1000);
        $timeout (scope.refresh, ConfigApp.session.timeout *250);
    }

    return {
        template: template,
        scope: {
            callback : "="
        },
        restrict: 'E',
        link: mymethods
    };
});

})();
console.log ("Token Refresh Loaded");

