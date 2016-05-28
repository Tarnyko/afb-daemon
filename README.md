### Sample client application for Application Framework Binder

![AFB-Client screenshot](http://iot.bzh/images/afb-client.jpg)

_(Application Framework Binder can be found on https://github.com/iotbzh/afb-daemon)_

## Installation

Install HTML5 development toolchain on your host

    1. Check out this repository
       git clone https://github.com/iotbzh/afb-client.git

    2) Install NodeJs [not used on target] 
       zypper install nodejs
       yum install nodejs

    3) Install building tools [bower, gulp, ....]
       npm install # this install all development tool chain dependencies
       sudo npm install --global gulp  # this is not mandatory but it will make your live simpler


### Overload ./app/etc/AppDefaults.js with '.noderc.js'
    var config= {
        APPNAME : 'AFBclient',   // AppName is use as main Angular Module name
        FRONTEND: "Frontend",    // HTML5 frontend  [no leading ./]
        BACKEND : "Backend",     // NodeJS Rest API [no leading ./]
        URLBASE : '/opa/',       // HTML basedir when running in production [should end with a /]
        APIBASE : '/api/',       // Api url base dir [should end with a /]
    };
    module.exports = config;

    WARNING: in current development version Frontend/services/AppConfig.js is not updated automatically
    you should manually assert that backend config is in sync with frontend config.

### Build project
    gulp help
    gulp build-app-dev
    rsync -az dist.dev xxxx@agl-target:afb-client

### Test with Application

    # Start AppFramework Binder
        export MYWORKSPACE=$HOME/Workspace
        $MYWORKSPACE/afb-daemon/build/afb-daemon --port=1234 --verbose --token=123456789 --rootdir=$MYWORKSPACE/afb-client/dist.dev

    Point your browser onto: http://agl-target:1234/opa

    Note: 
      - do not forget '/opa' that should match with your config.URLBASE
      - if you change --token=xxxx do not forget to update ./Frontend/pages/HomeModules.js
      - Force HTML/OPA reload with F5 after each HTML5/OPA update or new pages may not be loaded. 
      - When reloading HTML/OPA with F5 do not forget that your initial token wont be accepted anymore. You should either:
        + restart to clean existing session
        + cleanup AJB_session cookie
        + start an anonymous web page to get a fresh and clean environment.

### Move to Target
    cd $MYWORKSPACE/afb-client
    gulp build-app-prod
    scp -r ./dist.prod/* user@mytarget:/rootdir/afb-client
    ssh user@mytarget "afb-daemon --port=3001 --token='' --rootdir=/rootdir/afb-client"
    http://mytarget:3001/opa

### Directory structure
    /AppClient
    |
    |---- package.json
    |---- bower.json
    |---- gulpfile.js
    |
    |---- /Frontend
    |     |
    |     |---- index.html
    |     |---- app.js
    |     |
    |     |---- /styles
    |     |     |
    |     |     |---- _settings.scss
    |     |     |---- app.scss
    |     |
    |     |---- /Widgets
    |     |     |
    |     |     |--- Widget-1
    |     |     |...
    |     |
    |     |-----/Pages
    |           |--- Home-Page
    |           |... 
    |
    |
    |---- (/dist.dev)
    |---- (/dist.prod)

