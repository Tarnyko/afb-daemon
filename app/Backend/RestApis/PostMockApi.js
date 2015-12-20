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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * References: https://github.com/expressjs/multer
 */

var fs = require('fs');
var multer = require('multer');
 
function NewApi(handle, prefix) {
    var scope=this; // make sure not to loose object context in async callback
    
    // defined upload directory and check it's a valid one
    var upload = multer({ dest: handle.config.UPLOAD_DIR});
    // WARNING: single('avatar') should match with <upload-image name="avatar">
    handle.app.post(prefix +'/upload-image', upload.single('avatar'), function (req, res) {
        
        handle.trace (scope, 1, "%s/upload file=%s dest=%s/%s", prefix, req.file.originalname, req.file.destination, req.file.filename);
        res.send({"jtype": "TEST_message", "status": "success", "info": "done"});
    });
    
    // WARNING: single('music') should match with <upload-audio name="music">
    handle.app.post(prefix +'/upload-music', upload.single('music'), function (req, res) {
        
        handle.trace (scope, 1, "%s/upload file=%s dest=%s/%s", prefix, req.file.originalname, req.file.destination, req.file.filename);
        res.send({"jtype": "TEST_message", "status": "success", "info": "done"});
    });
    
    // WARNING: single('appli') should match with <upload-audio name="appli">
    handle.app.post(prefix +'/upload-appli', upload.single('appli'), function (req, res) {
        
        handle.trace (scope, 1, "%s/upload file=%s dest=%s/%s", prefix, req.file.originalname, req.file.destination, req.file.filename);
        res.send({"jtype": "TEST_message", "status": "success", "info": "done"});
    });
    
}

// Export Class
module.exports = NewApi;