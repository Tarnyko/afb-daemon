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
 */

var fs = require('fs');
var multer = require('multer');
 
function NewApi(handle, prefix) {
    var self=this;
    handle.trace (this,1, "Mock PostApi url=%s", prefix +'/ping');
    var upload = multer({ dest: '/tmp/uploads/' });
    
    handle.app.post(prefix +'/upload', upload.single('avatar'), function (req, res) {
        handle.trace (self, 1, "%s/upload file=", prefix, req.file.originalname);
        var upload = multer({ dest: '/tmp/uploads/' });
        
        res.send({"jtype": "TEST_message", "status": "success", "info": "done"});
    });
    
}

// Export Class
module.exports = NewApi;