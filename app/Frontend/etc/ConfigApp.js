(function () {
    'use strict';

    // _all modules only reference dependencies
    angular.module('ConfigApp', [])

            // Factory is a singleton and share its context within all instances.
            .factory('ConfigApp', function (urlquery) {

                var myConfig = {
                    paths: { // Warning paths should end with /
                        image : 'images/',
                        avatar: 'images/avatars/',
                        audio : 'images/audio/',
                        appli : 'images/appli/'
                    },
                    
                    myapi: { // Warning paths should end with /
                       token : '/api/myplugin/xxxx'
                    },
                    
                    session: { // Those data are updated by session service
                       create  : '/api/token/create',
                       refresh : '/api/token/refresh',
                       check   : '/api/token/check',
                       reset   : '/api/token/reset',
                       ping    : '/api/token/check',
                       initial : urlquery.token || '123456789',  // typical dev initial token
                       timeout : 3600,         // timeout is updated client sessin context creation
                       pingrate: 60,           // Ping rate to check if server is still alive
                       uuid    : '',           // uuid map with cookie or long term session access key
                       token   : ''            // will be returned from authentication    
                    }
                };

                return myConfig;
            });

})();