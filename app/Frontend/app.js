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
    'UploadFiles',
    'LinkButton',
    'TokenRefresh',
    'RangeSlider',
    'ModalNotification'
  ])
    .config(config)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];
  
  console.log ("***location=" + window.location + " search" + window.search);

  function config($urlProvider, $locationProvider, ConfigApp) {
    $urlProvider.otherwise('/home');

    // https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode(true).hashPrefix('!');
    
  }

  function run() {
    FastClick.attach(document.body);
  }

console.log ("opa=@@APPNAME@@ Loaded");
})();
