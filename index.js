var arDrone = require('ar-drone')
var client  = arDrone.createClient()
var stream = arDrone.createUdpNavdataStream();

function land() {
  client.land()
}
process.on('exit', land)
process.on('unCaughtException', land)

client.config('general:navdata_demo', 'FALSE');
client.takeoff()


client.on('navdata', function(navdata) {

  // land if we go higher than 2m
  if (navdata.demo.altitudeMeters > 20) client.land()
})


//client
  //.after(5000, function() {
  //this.up(0.8)
//}).after(1000, function() {
  //this.up(0)
  //this.clockwise(0.5)
//}).after(3000, function() {
  //this.clockwise(0)
  //this.land()
//})


