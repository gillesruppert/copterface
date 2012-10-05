var arDrone = require('ar-drone');
var path = require('path');
var tako = require('tako');
var app = tako();
var fs = require('fs');


var client  = arDrone.createClient();
client.createRepl();


var Faces = require('./faces')


var f = new Faces(client);

function logStatus() {
  f.status(function(reply) {
    console.log('reply', reply);
    setTimeout(function(){
      logStatus();
    }, 100)
  })
}
setTimeout(function() {
  logStatus();
}, 1000);

app.route('/last.png').on('request', function(req, resp){
  resp.write(f.lastImage_ || '');
})
app.route('/debug').on('request', function(req, resp){
  fs.createReadStream('./static/debug.htm').pipe(resp);
})
app.route('*').on('request', function(req, resp){
  resp.end();
})

app.httpServer.listen(3200)