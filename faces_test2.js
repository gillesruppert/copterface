var arDrone = require('ar-drone');
var path = require('path');
var tako = require('tako');
var app = tako();
var fs = require('fs');


var client  = arDrone.createClient();
client.createRepl();


var Faces = require('./faces')


var f = new Faces(client);

client.takeoff();
client.up(.1);
client.after(100, function() {
  this.up(0);
})

function getInfo() {
  f.status(function(s) {
    console.log(s);
    if (s.face) {
      //ar f = s.face.x > 320 ? client.clockwise : client.counterClockwise;
      client.clockwise(.3);
      client.front(.1);
      client.after(200, function() {
        this.clockwise(0);
        client.front(0);
        getInfo();
      })
    }
    else if (s.picture) {
      client.animateLeds('blinkRed', 5, 2)
      client.after(500, function() {
        this.clockwize(.3);
        this.after(300, function() {
          this.clockwise(0);
          getInfo();
        })
      })
    }
    else if (s.nothing) {
      client.clockwise(.3);
      client.after(500, function() {
        this.clockwise(0);
        getInfo();
      })
    }
  });
}

setTimeout(function(){
  getInfo();
}, 2000)

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