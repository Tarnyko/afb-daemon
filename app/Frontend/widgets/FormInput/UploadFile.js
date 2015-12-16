
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
 * 
 * Reference: 
 *   https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications#Using_hidden_file_input_elements_using_the_click%28%29_method
 *   https://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
 *   https://www.terlici.com/2015/05/16/uploading-files-locally.html
 *   https://github.com/nervgh/angular-file-upload/blob/master/src/services/FileUploader.js
 */

   
function changeInput() {
     console.log ('input imgClicked'); 
}   

(function() {
'use strict';

// WARNING: Angular ng-change does not work on input/file. Let's hook our callback through standard JS function
var tmpl = '<form target="null" action="/api/afbs/file-upload" method="post" enctype="multipart/form-data" >'+
           '<input type="file" name="{{name}}" onchange="angular.element(this).scope().UpLoadFile(this.files)" accept="{{mime}}/*" style="display" >'+
           '<input type="submit" class="submit" style="display" > ' +
           '</form>' + 
           '<img id="{{name}}-img" src="{{imagepath}}" ng-click="imgClicked()">' ;

function basename(path) {
   return path.split('/').reverse()[0];
}

angular.module('UploadFile',['ConfigApp'])

.directive('uploadFile', function(ConfigApp, $http, JQemu) {
    function mymethods(scope, elem, attrs) {
 
        // get widget image handle from template
        scope.imgElem    = elem.find('img');
        scope.inputElem  = elem.find('input');
        scope.submitElem = JQemu.findByType (elem.children(), "submit");

        
        // Image was ckick let's simulate an input (file) click
        scope.imgClicked = function () {
            scope.inputElem[0].click(); // Warning Angular TriggerEvent does not work!!!
        };
        
        // upload file to server 
        scope.UpLoadFile= function(files) {
            

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log ("Selected file=" + file.name + " size="+ file.size/1024);
                var mimeType = /image.*/;  // build regular expression from Mime
                if (!file.type.match(mimeType)) {
                    continue;
                }
                         
                if (file.size > scope.sizemax*1024) {
                    scope.imagepath = scope.istoobig; // warning is path is wrong nothing happen
                    scope.$apply('imagepath'); // we short-circuit Angular resync Image
                } else {

                    scope.basename=basename(file.name);
                    scope.imgElem[0].file = file;

                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function (upload) {
                        scope.imagepath = upload.target.result;
                        scope.$apply('imagepath'); // we short-circuit Angular resync image
                        scope.submitElem[0].click(); // Warning Angular TriggerEvent does not work!!!
                    };
                }
            }
        };

        // Initiallize default values from attributes values
        if (attrs.icon) scope.imagepath= ConfigApp.paths[attrs.category] +  attrs.icon;
        else  scope.imagepath=ConfigApp.paths.avatars + 'tux-bzh.png';
        
        if (attrs.istoobig) scope.istoobig= ConfigApp.paths[attrs.category] +  attrs.istoobig;
        else  scope.istoobig=ConfigApp.paths.avatars + 'istoobig.jpg';
        
        scope.name= attrs.name || 'avatar';
        scope.mime= attrs.mime || 'image';
        scope.sizemax= attrs.sizemax || 100; // default max size 100KB
    
    }
    
    return {
        restrict: 'E',
        template: tmpl,
        link: mymethods,
        scope: {
            callback : '='
        }
    };
});

console.log ("UploadFile Loaded");
})();
