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
angular.module('TokenRefresh', ['AppConfig', 'ModalNotification'])

    .directive ('tokenRefresh', function($timeout, $http, $location, Notification, AppConfig) {

    function mymethods(scope, elem, attrs) {
        scope.logged=undefined; // neither thu neither false
         
        scope.online = function () {
            elem.addClass    ("online");
            elem.removeClass ("offline");
            scope.logged=true;
        };

        scope.offline = function(){
            elem.addClass    ("offline");
            elem.removeClass ("online");
            scope.logged=false;
        };
        
        scope.onerror = function(data, errcode, headers) {
            if (scope.logged !== false)  {
                Notification.warning ({message: "AppFramework Binder Lost", delay: 5000});
                scope.offline();
            }
            scope.status = 0;
        };
        
        scope.onsuccess = function(data, errcode, headers, config) {
            if (data.request.token) AppConfig.session.token = data.request.token;
            if (data.request.uuid)  AppConfig.session.uuid  = data.request.uuid;
            if (data.request.timeout)  AppConfig.session.timeout  = data.request.timeout;
            if (scope.logged !== true)  {
                Notification.success ({message: "AppFramework Binder Back to Live", delay: 3000});
                scope.online();
                if (scope.callback) scope.callback();
            }
            scope.status = 1;
        };

        // Check Binder status
        scope.getping = function() {

            var handler = $http.get(AppConfig.session.ping+'?token='+ AppConfig.session.token);
            
            // process success and error
            handler.success(scope.onsuccess);
            handler.error(scope.onerror);

            // restart a new timer for next ping
            $timeout (scope.getping, AppConfig.session.pingrate*1000);
        };
        
        // Check Binder status
        scope.refresh = function() {
            var handler = $http.get(AppConfig.session.refresh+'?token='+ AppConfig.session.token);
            
            // process success and error
            handler.success(scope.onsuccess);
            handler.error(scope.onerror);
            // restart a new timer for next refresh to 1/4 of timeout session
            $timeout (scope.refresh, AppConfig.session.timeout *250);
        };
        
        // Initial connection
        scope.tkcreate = function() {
            var handler = $http.get(AppConfig.session.create+'?token='+ AppConfig.session.initial);
            
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
        $timeout (scope.getping, AppConfig.session.pingrate*1000);
        $timeout (scope.refresh, AppConfig.session.timeout *250);
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

