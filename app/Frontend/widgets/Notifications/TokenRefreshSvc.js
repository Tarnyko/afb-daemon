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
          '<div class="afb-monitor">'
        + '<span class="afb-refresh-token" ng-click="getping" >afb://{{hostname}}:{{httpdport}}</span>'
        + '<i class="{{icon}}"></i>'
        + '</div>'
        ;


// scope module is load statically before any route is cativated
angular.module('TokenRefresh', [])

    .directive ('tokenRefresh', function($timeout, $http, $location, Notification, ConfigApp) {

    function mymethods(scope, elem, attrs) {
        
        scope.status;
    
        scope.online = function () {
            elem.addClass    ("online");
            elem.removeClass ("offline");
        };

        scope.offline = function(){
            elem.addClass    ("offline");
            elem.removeClass ("online");
        };

        // Check Binder status
        scope.getping = function() {

            var handler = $http.get(ConfigApp.api.ping+'xx?token='+ ConfigApp.session.token);
            handler.success(function(response, errcode, headers, config) {
                if (!scope.status)  {
                    Notification.success ({message: "AFB Back to Live", delay: 3000});
                    scope.online();
                }
                scope.status = 1;
            });

            handler.error(function(response, errcode, headers) {
                if (scope.status)  {
                    Notification.warning ({message: "AFB Lost", delay: 5000});
                    scope.offline();
                }
                scope.status = 0;
            });

            // restart a new timer for next ping
            $timeout (scope.getping, ConfigApp.session.pingrate*1000);
        };
        
        // Check Binder status
        scope.refresh = function() {
            var handler = $http.get(ConfigApp.api.refresh+'?token='+ ConfigApp.session.token);
            $timeout (scope.refresh, ConfigApp.session.timeout *800);
        };
 
        scope.icon      = attrs.icon   || "fi-lightbulb";
        scope.hostname  = $location.host();
        scope.httpdport = $location.port();
        
        scope.getping();
        scope.refresh();
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

