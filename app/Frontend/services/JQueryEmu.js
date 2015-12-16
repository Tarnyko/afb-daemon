(function () {
    'use strict';

    // _all modules only reference dependencies
    angular.module('JQueryEmu', [])

            // Factory is a singleton and share its context within all instances.
            .factory('JQemu', function () {

                // JQueryLight cannot search a tag within ancestrors
                var parent = function (element, selector) {
                    var parent = element;
                    var search = selector.toUpperCase();
                    while (parent[0]) {
                        if (search === parent[0].tagName) {
                            return parent;
                        }  // HTMLDivElement properties
                        parent = parent.parent();
                    }
                };
                
                // JQueryLight cannot search by type
                var  findByType= function (element, selector) {
                    var search = selector.toLowerCase();
                    var children = element.children();
                    while (children[0]) {
                        if (search === children[0].type) {
                            return children;
                        }  // HTMLDivElement properties
                        children = children.next();
                    }
                };

                var myMethods = {
                    parent: parent,
                    findByType: findByType
                };

                return myMethods;
            });

})();