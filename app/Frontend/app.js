(function() {
  'use strict';

  angular.module('@@APPNAME@@', [ // Warning: Appname should fit with gulpfile.js & index.html
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',
    
    // external components
    'ui-notification',
    
    // Application Components
    'ConfigApp',
    'JQueryEmu',
    'HomeModule',
    'SampleModule',
    'UploadFile',
    'LinkButton',
    'ModalNotification'
  ])
    .config(config)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/home');

    // https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode(true).hashPrefix('!');
    
  }

  function run() {
    FastClick.attach(document.body);
  }

console.log ("@@APPNAME@@ Loaded");
})();
