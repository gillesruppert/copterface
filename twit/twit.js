var Twit = require('twit');

var T = new Twit({
    consumer_key:         'z1KDqb7O8HyVIzUuhB20jg'
  , consumer_secret:      'lC2aqnIKC2ruQ3MpZMWOs2K2YBgun62HCjdCSy9ak'
  , access_token:         '862957231-FAhrMkuUw4KkaiZwEPdh9O1luRD7dV9xGUtu6KRQ'
  , access_token_secret:  'w2voYczwf5iGapx8sKiCseYW0l7ZoivMSBaA0vYZWs'
});


//console.log('t', T)
//
//  tweet 'hello world!'
//
T.post('statuses/update', { status: 'hello world!' }, function(err, reply) {
  // hello world
  console.log('t', err, reply)
});

//
//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//
T.get('search/tweets', { q: 'banana', since: '2011-11-11' }, function(err, reply) {
  //  ...

});

//
//  stream a sample of public statuses
//
// var stream = T.stream('statuses/sample')
// console.log('stream',stream)
// stream.on('tweet', function (tweet) {
//   console.log('tweet1', tweet); 
// });

// //
// //  filter the twitter public stream by the word 'mango'. 
// //
// var stream = T.stream('statuses/filter', { track: 'nodecoptor' })
// //console.log('err',T.stream())
// stream.on('tweet', function (tweet) {
//   //console.log('tweet2',tweet);
// });