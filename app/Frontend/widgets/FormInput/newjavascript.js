/* 
 * Copyright (C) 2015 fulup
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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

 var reader = new FileReader();
 // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          var $title = $("<h4>", {
            text : theFile.name
          });
          $result.append($title);
          var $fileContent = $("<ul>");
          try {

            var dateBefore = new Date();
            // read the content of the file with JSZip
            var zip = new JSZip(e.target.result);
            var dateAfter = new Date();

            $title.append($("<span>", {
              text:" (parsed in " + (dateAfter - dateBefore) + "ms)"
            }));

            // that, or a good ol' for(var entryName in zip.files)
            $.each(zip.files, function (index, zipEntry) {
              $fileContent.append($("<li>", {
                text : zipEntry.name
              }));
              // the content is here : zipEntry.asText()
            });
            // end of the magic !

          } catch(e) {
            $fileContent = $("<div>", {
              "class" : "alert alert-danger",
              text : "Error reading " + theFile.name + " : " + e.message
            });
          }
          $result.append($fileContent);
        }
      })(f);