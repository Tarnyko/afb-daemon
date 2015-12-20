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

var SESSION_TIMEOUT= 3600000; // default is 1h loggin session

// Default config will be superseaded by ProjectRoot/.config-l4a.js $HOME/.config-l4a.js /etc/default/config-l4a.js
config = {
        
    APPNAME : 'AFBclient',   // AppName is use as main Angular Module name
    FRONTEND: "Frontend",    // HTML5 frontend  [no leading ./]
    BACKEND : "Backend",     // NodeJS Rest API [no leading ./]
    URLBASE : '/opa/',       // HTML basedir when running in production [should end with a /]
    APIBASE : '/api/',       // Api url base dir [should end with a /]
    DEBUG   : 4001,          // Node Debug Port
    DBG_LVL : 5,             // Debug Trace Level 0=no trace.
    
    UPLOAD_DIR: '/tmp/uploads',  // directory destination for uploaded files [/api/post/upload]
    
    // EXPRESS WEB server config [note: URLBASE generate rewriting rules]
    EXPRESS_HOST    : 'localhost',         // HTTP will only listen on related Internet interface
    EXPRESS_PORT    : 4000,                // HTTP port
    EXPRESS_LOGDIR  : __dirname + '/../../log',  // httpd log file
    EXPRESS_SECRET  : Math.random().toString(36).slice(2), // [default cookie session]
    EXPRESS_SESSION : SESSION_TIMEOUT
};

module.exports = config;

