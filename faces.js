var crop = require('./crop');

var Faces = function(client) {
  this.lock_ = false;
  this.client_ = client;
}
Faces.prototype.init = function(cb) {
  var pngStream = this.client_.createPngStream();
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

         var buf = crop(this.lastImage_, x.x, x.y, x.width, x.height);


         /*
         im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
         im.save('./out.jpg');
         */

         fs.writeFile('faces/' + Math.floor(Math.random()*1e6) + '.png', buf, function() {});

         // good enough.
         if (x.width > 200) {
           result.picture = true;
           result.image = buf;
         }
         else {
           result.face = true;
           result.x = x.x;
           result.y = x.y;
           result.w = x.width;
           result.h = x.height;
         }

       }
       setTimeout(function() {
         self.lock_ = false;
       }, 100)
       cb(result);
     });
  })
};
