
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

    4. For livereload functionality [automatic refresh of HTML/CSS]
       install [livereload Chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)


### Overload ./app/etc/AppDefaults.js with '.noderc.js'
    var config= {
        APPNAME : 'AFBclient',   // AppName is use as main Angular Module name
        FRONTEND: "Frontend",    // HTML5 frontend  [no leading ./]
        BACKEND : "Backend",     // NodeJS Rest API [no leading ./]
        URLBASE : '/opa/',       // HTML basedir when running in production [should end with a /]
        APIBASE : '/api/',       // Api url base dir [should end with a /]
        DEBUG   : 4001,          // Node Debug Port [for mock API debug only]
        DBG_LVL : 5,             // Debug Trace Level 0=no trace.
    };
    module.exports = config;

    WARNING: in current version Frontend/services/ConfigApp.js is not updated automatically
    you should make sure than your backend config fit with your frontend config.
    Note: FCS version should have ConfigApp.js configurated automatically from GULP, but this is for "tomorrow"

### Build project
    gulp help
    gulp build-app-dev
    gulp watch-dev 
    http://localhost:3001/opa  /* debug mock api base on Backend/RestApi */

### Test with Application server binder

    # Start AppFramework Binder
        export MYWORKSPACE=$HOME/Workspace
        $MYWORKSPACE/afb-daemon/build/afb-daemon --port=1234 --verbose --token=123456789 --rootdir=$MYWORKSPACE/afb-client/dist.dev

    Point your browser onto: http://localhost:1234/opa

    Note: 
      - do not forget '/opa' that should match with your config.URLBASE
      - if you change --token=xxxx do not forget to update ./Frontend/pages/HomeModules.js
      - Force HTML/OPA reload with F5 after each HTML5/OPA update or new pages may not be loaded. 
      - When reloading HTML/OPA with F5 do not forget that your initial token wont be accepted anymore. You should either restart to clean existing session or cleanup AJB_session cookie.

### Move to Target
    cd $MYWORKSPACE/afb-client
    gulp build-app-prod
    scp -r ./dist.pro/* user@mytarget:/rootdir/apfDaemon

    /AppClient
    |
    |---- package.json
    |---- bower.json
    |---- gulpfile.js
    |---- .noderc.js  [Warning: contains private keys should not uploaded in Github]
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
    |---- /Backend
    |     |-- server.js     // launcher
    |     |----/ models     // mogoose database schemas
    |     |----/ providers  // authentication services
    |     |----/ restapis   // application APIs
    |
    |---- (/dist.dev)
    |---- (/dist.prod)

    