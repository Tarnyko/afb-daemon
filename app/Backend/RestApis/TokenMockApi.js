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

/* ----------------------------------------------------------------------
 *   This module simulate Application Framework Binder
 *   
 *   /api/afbs/create
 *   /api/afbs/check?token=123456789
 *   /api/afbs/refresh?token=123456789-xxxxx
 *   /api/afbs/reset?123456789-xxxxx
 *   
 *   Note: this MOCK api does not handle any session login. It only returns 
 *   a fake valid or false message depending on call order.
 *   Its goal is to get a quick way to check you HTML5 client rendering & behaviour.
 *   
 *   When you're happy with you HTML5 client OnePageApp check it with afb-daemon
 * ----------------------------------------------------------------------*/

 
function NewApi(handle, prefix) {
    var scope=this; // I hate JavaScript
    scope.connected=false;
    
    // Simulate Client Context Session Creation
    handle.app.get(prefix +'/create', function (req, res) {
        handle.trace (scope, 1, "%s/create body=%s", prefix, req.body.action);
        var okResponse= '{ "jtype": "AJB_reply"' +
                        ', "request": { "prefix": "afbs", "api": "create", "uuid": "e4ef5e66-xxxx", "token": "123456789-xxxxx", "status": "processed" }'+
                        ', "response": { "token": "Token was refreshed" }'+
                        '}';
                
        var fxResponse= '{ "jtype": "AJB_reply" ' +
                        ', "request": { "prefix": "afbs", "api": "create", "status": "fail", "info": "AFB_SESSION_REFRESH Not Initial Token Chain" }'+
                        '}';
    
        if (scope.connected) res.status(401).send(fxResponse);
        else {
            res.send(okResponse);
            scope.connected=true;
        }
    });
    
    
    // Simulate Client Context Check
    handle.app.get(prefix +'/check', function (req, res) {
        handle.trace (scope, 1, "%s/check query=%s", prefix, req.query.token);
        var okResponse= '{"jtype":"AJB_reply"'+
                        ',"request":{"prefix":"afbs","api":"check", "status":"processed"}'+
                        ',"response":{"isvalid":true}'+
                        '}';
                
        var fxResponse= '{"jtype":"AJB_reply",'+
                        '"request":{"prefix":"afbs","api":"check","status":"empty","info":"AFB_SESSION_CHECK Not a Valid Active Token"}'+
                        '}';
    
        if (!scope.connected) res.status(401).send(fxResponse);
        else res.send(okResponse);
    });
    
    // Simulate Client Context Check
    handle.app.get(prefix +'/refresh', function (req, res) {
        handle.trace (scope, 1, "%s/refresh query=%s", prefix, req.query.token);
        var okResponse= '{"jtype":"AJB_reply"'+
                        ',"request":{"prefix":"afbs","api":"refresh","uuid": "e4ef5e66-xxxx", "token": "123456789-xxxxx","status":"processed"}'+
                        ',"response":{"isvalid":true}'+
                        '}';
                
        var fxResponse= '{"jtype":"AJB_reply",'+
                        '"request":{"prefix":"afbs","api":"refresh","status":"empty","info":"AFB_SESSION_REFRESH Not a Valid Active Token"}'+
                        '}';
    
        if (!scope.connected) res.status(401).send(fxResponse);
        else res.send(okResponse);
    });

        // Simulate Client Context Session Closing
    handle.app.get(prefix +'/reset', function (req, res) {
        handle.trace (scope, 1, "%s/reset query=%s", prefix, req.query.token);
        var okResponse= '{"jtype":"AJB_reply"'+
                        ',"request":{"prefix":"afbs","api":"reset","uuid": "e4ef5e66-xxxx","status":"processed"}'+
                        ',"response":{"uuid":"b028b883-8b47-4c6d-9c6e-e79b9e2b81b9"}'+
                        '}';
                
        var fxResponse= '{"jtype":"AJB_reply",'+
                        '"request":{"prefix":"afbs","api":"reset","status":"empty","info":"AFB_SESSION_CLOSE Not a Valid Access Token"}'+
                        '}';
    
        if (!scope.connected) res.status(401).send(fxResponse);
        else {
            res.send(okResponse);
            scope.connected=false;
        }
    });
    

}

// Export Class
module.exports = NewApi;