var config  = require('../etc/_Config');
var trace   = require('../etc/_Trace');
var RestAPI = require('./RestApis/_all');
var fs      = require('fs');

var express        = require('express');
var session        = require('express-session');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// instanciate express HTTP server
var app = express();

// chose dev or prod rootdir
var staticdir = 'dist.dev';
if (process.env.MODE) staticdir = process.env.MODE === 'prod' ? 'dist.prod' : 'dist.dev';
else staticdir = config.MODE === 'prod' ? 'dist.prod' : 'dist.dev';

var rootdir = __dirname + '/../../' + staticdir;
if (!fs.existsSync(rootdir)) {
    console.log("### HOOPS Rootdir not found rootdir=%s\n", rootdir);
    process.exit();
}

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

// This handle should contain enough for application logic
var serverHandle = {
  app  :  app,           // Express server
  config: config,
  trace:  config.DBG_LVL > 0 ? trace : function(){/*empty function */}
};

// set the static files location /public/img will be /img for users
app.use(express.static(rootdir)); 

// Load Mock APIs
var apirest = new RestAPI(serverHandle);

app.get(config.URLBASE, function (req, res) {
    console.log ("Angular OPA %s", req.originalUrl);
    res.sendfile(config.URLBASE +"index.html", {root: rootdir});
});

// rewrite requested URL to include Angular hashPrompt and set session flag for RestAPI
app.get(config.URLBASE + '*', function(req, res) {
    // Warning redirect should be under exact "/opa/#!page" or a redirect to home will be done
    var redirect=config.URLBASE + '#!' + req.originalUrl.substring(config.URLBASE.length);
    res.redirect(redirect);
    console.log ("Redirect to: ", redirect);
});


// start app ===============================================
app.listen(config.EXPRESS_PORT, config.EXPRESS_HOST);
console.log('Server Listening http://%s:%d (rootdir=%s)', config.EXPRESS_HOST, config.EXPRESS_PORT, rootdir);