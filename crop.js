var Canvas = require('canvas');

module.exports =  function(buffer, x, y, width, height) {

  var canvas = new Canvas(width,height)
    , ctx = canvas.getContext('2d');

  var img = new Canvas.Image;
  img.src = buffer;
  ctx.drawImage(img, -x, -y);

  return canvas.toBuffer();
}