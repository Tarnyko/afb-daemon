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
 * GNU General Public License for more details.
 */

(function() {
'use strict';

var tmpl = '<input-text  class="password" tip="{{tip1}}"  placeholder="{{place1}}"' +
           'label="{{label1}}" callback="valid1" name="{{name}}-1" value="pass1" required minlen="{{minlen}}" type="password" >' +
           '</input-text>' + 
           '<input-text  class="password" tip="tip2"  placeholder="{{place2}}"' +
           'label="{{label2}}" callback="valid2" name="{{name}}-2" value="pass2" required minlen="{{minlen}}" type="password" > '+
           '</input-text>';

angular.module('InputPassword',[])

.directive('inputPassword', function() {
    function mymethods(scope, elem, attrs) {
    
    scope.valid1 = function (name, value) {
        console.log ("Clicked InputPassword1 name=%s value=%s", name, value);        
        scope.firstpwd = value;
    };
    
    scope.valid2 = function (name, value, done) {        
        console.log ("Clicked InputPassword2 name=%s value=%s", name, value);        
        
        // if both passwd equal then call form CB
        if (scope.firstpwd !== value) {
          done({valid: false, status: 'invalid', errmsg: "both password should match"});  
        } else {  
          scope.callback (attrs.name, value);
        }
                  
     };
     
     // this method can be called from controller to update widget status
     scope.done=function (data) {
       console.log ("Text-Input Callback ID="+ attrs.name + " data=", data);
       for (var i in data) scope[i] = data[i];         
     };
     
     // Export some attributes within directive scope for template
     scope.name   = attrs.name;
     scope.label1 = attrs.label || 'Password';
     scope.label2 = attrs.label || 'Password Verification';
     scope.place1 = attrs.placeholder1 || 'User Password';
     scope.tip1   = attrs.tip || 'Choose a Password';
     scope.place2 = attrs.placeholder1 || 'Password Verification';
     scope.tip2   = attrs.tip    || 'Confirme your Password';
     scope.minlen = attrs.minlen || 10;
     
     if ("required" in attrs) scope.required = 'required';
         
    }
    
    return {
        restrict: 'E',
        template: tmpl,
        link: mymethods,
        scope: {
            callback : '=',
        }
    };
});

console.log ("InputPassword Loaded");
})();
