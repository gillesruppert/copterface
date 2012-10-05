var arDrone = require('ar-drone')
var client  = arDrone.createClient()
var stream = arDrone.createUdpNavdataStream();
var EventEmitter = require('events').EventEmitter

function land() {
  console.log('land')
  client.land()
}

client.config('general:navdata_demo', 'FALSE');

var Controller = function(){}
var p = Controller.prototype = new EventEmitter()

p.init = function() {
  console.log('init');
  client.takeoff()
  var self = this

  client.on('navdata', function(navdata) {
    var alt = navdata.demo.altitudeMeters
    self.altitude = alt
    self.emit('altitude', self.altitude)

    // Safety: land if we go higher than 2m
    if (alt > 30) client.land()
  })

  setTimeout(function() {
    self.emit('readydrone')
  }, 2000);
}

p.getAltitude = function() {
  return this.altitude
}

p.up = function(speed, maxAlt) {
  console.log('cmd->up', speed, maxAlt);
  var self = this
  client.up(speed)
  this.on('altitude', stop)

  function stop(alt) {
    console.log('check altitude', alt)
    if (alt <= maxAlt) client.stop()
    self.removeListener('altitude', stop)
    self.emit('upDone')
  }
}

p.circle = function() {
  client.front(0.3)
  client.clockwise(0.7)
}

p.stop = client.stop.bind(client)

var controller = new Controller()
controller.on('readydrone', function() {
  console.log('ready')
  controller.up(0.5, 20)
})
controller.once('upDone', client.land.bind(client));

controller.init()


