# A Cordova app to test cordova-plugin-chrome-apps-sockets-tcp

### Build you self
1. create a cordova project: `cordova create hello com.example.hello HelloWorld`
2. cd in to project directory
3. add platforms: `cordova platform add android --save`
4. add plugin for tcp link: `cordova plugin add https://github.com/cs8425/cordova-plugin-chrome-apps-sockets-tcp.git#fix-tcp-read-stuck`
5. remove sample `www`: `rm -rf www`
6. clone this app: `git clone https://github.com/cs8425/tcp-test-app.git www`
7. build project: `cordova build android`

### tcp server
1. start by: `node server.js`


