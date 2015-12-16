(function () {
    'use strict';

    // _all modules only reference dependencies
    angular.module('ConfigApp', [])

            // Factory is a singleton and share its context within all instances.
            .factory('ConfigApp', function () {


                var myConfig = {
                    paths: { // Warning paths should end with /
                        images : 'images/',
                        avatars: 'images/avatars/'
                    },
                    
                    api: { // Warning paths should end with /
                       token : '/api/token/'
                    },
                    
                    session: { // Those data are updated by session service
                       refresh : '/api/token/refresh',
                       check : '/api/token/check',
                       token   : '123456789',  // typical dev initial token
                       timeout : 3600,         // timeout is updated client sessin context creation
                       uuid    : '',           // uuid map with cookie or long term session access key
                       pingrate: 60            // Ping rate to check if server is still alive
                    }
                };

                return myConfig;
            });

})();