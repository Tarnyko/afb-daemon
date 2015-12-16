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
                    }
                };

                return myConfig;
            });

})();