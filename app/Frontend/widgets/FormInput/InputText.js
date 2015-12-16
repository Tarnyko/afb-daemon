
/* 
 * Copyright (C) 2015 "IoT.bzh"
 * Author "Fulup Ar Foll"
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details..
 */



(function() {
'use strict';

var tmpl = '<tip-modal tip="tip"></tip-modal>' +
           '<label for="{{name}}-intext">{{label}} <i ng-show="required" ng-click="ToBeDefined" ' +
           'class="required {{status}} fi-checkbox" title="Free Value But Mandatory Argument" alt="?"> &nbsp; </i></label>'+          
           '<input '+
           ' type="{{type}}" id="{{name}}-intext" placeholder="{{placeholder}}"  class="status-{{status}}"'+
           ' ng-model="value" ng-blur="validate()" ng-focus="selected()" '+
           ' ng-model-options="{ updateOn: \'default blur\', debounce: {default: 500, blur: 0} }"' +
           '><alert data-ng-show="!valid&&errmsg">{{errmsg}}</alert>';

var emailpatern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

angular.module('InputText',['JQueryEmu'])

.directive('inputText', function(JQemu) {
    function mymethods(scope, elem, attrs) {
    
    // default value at 1st rendering
    scope.error  = false;
    scope.valid  = false;
    scope.status = 'untouch';
   
    scope.input = elem.find ("input");
    scope.required = 0;
    
    // requirer is use to increment requested counter
    if ("required" in attrs) {
        scope.required = 1;
        elem.addClass ("required");
    }
       
     // user enter input reset error status
     scope.selected = function () {
        scope.error=false; 
        scope.errmsg=false; 
        scope.status = 'touch';
     };   
            
     scope.validate = function () {
         
         // get value from input field bypassing Angular ng-model
         console.log ("Clicked InputText name=%s value=%s valid=%s", scope.name, scope.value, scope.valid);        

         // form is not untouched anymore
         scope.parent.removeClass ("ng-pristine");

         // if value not null clean up string
         if (scope.value) {
             scope.error=false; 
            // remove leading and trailling space
            scope.value = scope.value.trim();
         
            // remove any space is not allowed
            if ('nospace' in attrs) {
               scope.value=scope.value.replace(/\s/g, '');    
            }
         
            if ('lowercase' in attrs) {
               scope.value = scope.value.toLowerCase();
            }
         
            // check minimum lenght
            if ("minlen" in attrs) {
              if (scope.value.length < attrs.minlen) {
                 scope.status='invalid';
                 scope.errmsg=scope.name + ': Mininum Lengh= ' + attrs.minlen + ' Characters';
                 scope.error=true;
              }
            }
            
            if ('email' in attrs) {
            if (!emailpatern.test (scope.value)) {
                scope.status='invalid';
                scope.errmsg='invalid email address';
                scope.error=true;
            }
         }
         
        } else {
            if (scope.required) {
                 scope.status='invalid';
                 scope.errmsg=scope.name + ': Required Attribute';
                 scope.error=true; 
            }
        }
                           
         // If local control fail let's refuse input
         if (scope.error) {
             if (scope.required && scope.valid) {
                 scope.valid = false;
                 if (scope.l4acounter.validated > 0) scope.l4acounter.validated --;
             } 
             // use call to update form scope on form completeness
             scope.callback (attrs.name, null, scope.done);
         } else { 
             // localcheck is OK backup may nevertheless change status to false
            if (scope.required  && !scope.valid) scope.l4acounter.validated ++;
            scope.status='valid';
            scope.valid=true;
            scope.callback (attrs.name, scope.value, scope.done);
         }
          
     };
     
     // this method can be called from controller to update widget status
     scope.done=function (data) {
       console.log ("Text-Input Callback ID="+ attrs.name + " data=", data);
       for (var i in data) scope[i] = data[i];         
     };
     
     // Export some attributes within directive scope for template
     scope.label       = attrs.label;
     scope.name        = attrs.name;
     scope.placeholder = attrs.placeholder;
     scope.type        = attrs.type || "text";
     scope.tip         = attrs.tip;

     // search for form within parent elemnts
     scope.parent = JQemu.parent (elem, "FORM");

     // email enforce lowercase and nospace   
     if ("email" in attrs) {
        attrs.lowercase=true; 
        attrs.nospace=true; 
        attrs.minlen=6; 
     }

     if (scope.required) {
         scope.l4acounter = scope.parent.data ("l4acounter");
         if (!scope.l4acounter) { 
            scope.l4acounter =  {required:1, validated:0};
            console.log("Field "+scope.name+" is required (1st)");
            scope.parent.data ("l4acounter", scope.l4acounter); 
         } else {
             console.log("Field "+scope.name+" is required");
             scope.l4acounter.required ++;
         }
     }
         
     // refresh validation each time controler update value
     scope.$watch ('value', function(){
         if(scope.value) scope.validate(); }
     );
    
    }
    
    return {
        restrict: 'E',
        template: tmpl,
        link: mymethods,
        scope: {
            callback : '=',
            value: '='
        }
    };
});

console.log ("InputText Loaded");
})();
