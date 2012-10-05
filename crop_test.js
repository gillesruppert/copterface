var fs = require('fs');
var crop = require('./crop');

fs.writeFileSync('out2.png', crop(fs.readFileSync('out.jpg'), 200, 100, 50, 100));