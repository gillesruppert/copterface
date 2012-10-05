var arDrone = require('ar-drone');
var path = require('path');
var cv = require('opencv');
var tako = require('tako');
var app = tako();
var fs = require('fs');


var client  = arDrone.createClient();
client.createRepl();



var Faces = function(client) {
  this.lock_ = false;
}
Faces.prototype.init = function(cb) {
  var pngStream = client.createPngStream();
  this.cb_ = cb;
  var self = this;
  pngStream.on('data', function(data) {
    self.lastImage_ = data;
    self.tryFaceDetect_();
  });
  this.init_ = true;
}
Faces.prototype.status = function(cb) {
  if (!this.init_) return this.init(cb);
  this.cb_ = cb;
}
Faces.prototype.tryFaceDetect_ = function() {
  if (this.lock_ || !this.lastImage_ || !this.cb_) return;
  var cb = this.cb_;
  this.cb_ = null;
  this.lock_ = true;

  var result = {
    face: false,
    picture: false,
    nothing: false
  }
  var self = this;
  cv.readImage(this.lastImage_, function(err, im){
     im.detectObject("./node_modules/opencv/data/haarcascade_frontalface_alt.xml", {}, function(err, faces){
       //console.log('found ' + faces.length + ' faces');

       if (!faces.length) {
         result.nothing = true;
       }
       else {
         // Only need the biggest one.
         var index = 0;
         var size = 0;
         for (var i=0;i<faces.length; i++){
           if (faces[i].width > size) {
             size = faces[i].width;
             index = i;
           }
         }
         var x = faces[index]
         im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
         im.save('./out.jpg');

         result.face = true;
         result.x = x.x;
         result.y = x.y;
         result.w = x.width;
         result.h = x.height;
       }
       setTimeout(function() {
         self.lock_ = false;
       }, 100)
       cb(result);
     });
  })
};



var f = new Faces();

function logStatus() {
  f.status(function(reply) {
    console.log('reply', reply);
    setTimeout(function(){
      logStatus();
    }, 100)
  })
}

logStatus();

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