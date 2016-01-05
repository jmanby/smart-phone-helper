# The Smart Phone Helper

This application relies on Apache Cordova. Visit https://cordova.apache.org/#getstarted to install it and learn more information about it.

## Installation

The first step is to setup a new Cordova Project. For example, assuming the directory is to be named 'smarthelp', run the following commands:
```
$ cordova create smarthelp
$ cd smarthelp
```

Second, add the platform(s) for the smartphone that the mobile app will be run on:
```
$ cordova platform add android
```

Third, add the dependant plugins for the mobile app:
```
$ cordova plugin add cordova-plugin-ble-central
$ cordova plugin add cordova-plugin-file
$ cordova plugin add cordova-plugin-media
$ cordova plugin add cordova-plugin-whitelist
$ cordova plugin add https://github.com/katzer/cordova-plugin-email-composer.git
$ cordova plugin add https://github.com/Rohfosho/CordovaCallNumberPlugin.git
```

Next, delete the www directory and config.xml that is automatically created, and get the correct files from the git repository:
```
$ rm ./www
$ rm ./config.xml
$ git init
$ git remote add origin https://github.com/jmanby/smart-phone-helper
$ git fetch
$ git reset origin/master
$ git checkout www config.xml .gitignore README.md
```

To load the final version of the code that was used on Design Day at NCSU:
```
$ git checkout design_day
```

To load the most recent version of the code (not tested with device, but tested in browser and mobile app with device input simulated)
```
$ git checkout master
```

Finally, connect the smartphone and install the app:
```
$ cordova run android --device
```

Alternatively, create a final release version of the app (note filepath that is displayed upon successful completion of the build command):
```
$ cordova build android --release
```

## Platforms
This is tested to work on Android (Samsung Galaxy S4). It may also function on iOS as well without changing the code, since all dependent plugins run on iOS; however, it has not been tested yet on any device running that platform.

## About the app
The code in the design_day branch functioned as intended, but is not easy to update. There are 'doTask()' functions that can be modified to alter the behavior, and 'timer()' functions that can be altered to change the soundfile associated with a task. However, it is recommended to use the most updated version of the code found in the master branch. The only bug that was present in this version is that if the app is closed out while the Smartphone Helper device is connected, when the app is restarted, it will not realize that it is already connected, and the device will need to be power-cycled to reconnect it again.

The updated code in the master branch is much more modular, and incorporates Backbone.js to provide a Model-View framework with a RESTful API. AppView.js contains a method called 'setupMenu()' that saves information about each button on the Smartphone Helper device in a model, and can be modified to change the functionality of the buttons. The state of the connection is stored in a model, which should fix the bug in the design_day code. However, this has not been tested with the device yet. Index.html contains several buttons for debugging which should prove useful for continual development of the app, but ought to be removed before the app is deployed. (The sections of code to be removed are clearly marked. The code for this branch has more detailed commenting for understanding how everything works.