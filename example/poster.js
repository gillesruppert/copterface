"use strict";

var fs = require('fs')
var path = require('path')
var logger = require('nlogger').logger(module)
var request = require('request')
var util = require('utile')
var qs = require('querystring')


var TUMBLR_URL = util.format("http://api.tumblr.com/v2/blog/%s/post", "nsfwmeister.tumblr.com")
var YOUTUBE_EMBED = '<iframe width="420" height="315" src="http://www.youtube.com/embed/%s" frameborder="0" allowfullscreen></iframe>'
var VIMEO_EMBED = '<iframe src="http://player.vimeo.com/video/%s" width="500" height="375" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'


function read(file, done) {
  file = file || 'tmp/links.txt'

  file = path.normalize(__dirname + '/../' + file)
  logger.info('reading file', file)
  fs.readFile(file, 'utf-8', function(err, data) {
    if (err) {
      done(err, null)
    }
    else {
      var links = data.split('\n')
      if (links[links.length - 1] === '') {
        links.pop()
      }

      done(null, links)
    }
  })
}

function tumbelise(file, oauth, done) {
  read(file, function(err, links) {
    if (err || !Array.isArray(links)) {
      done(err)
    }
    else {
      util.async.forEachSeries(links, function(link, callback) {
        // FOR PRODUCTION
        var type = getType(link)
        var data = createPostData(type, link)
        postToTumble(data, oauth, callback)
      }, done)
    }
  })
}

function getType(link) {
  var photo_regex = /\.(?:jpe?g|gif|png)$/
  var youtube_regex = /^http:\/\/www\.youtube.com/
  var vimeo_regex = /^http:\/\/(?:www)?vimeo.com/
  var link_regex = /^https?:\/\//

  if (photo_regex.test(link)) return 'photo'
  if (youtube_regex.test(link)) return 'youtube'
  if (vimeo_regex.test(link)) return 'vimeo'
  if (link_regex.test(link)) return 'link'
}

function createPostData(type, link) {
  var data = {
    type: type,
    state: 'queue'
  }

  switch(type) {
    case 'link':
      data.url = link
      break
    case 'photo':
      data.source = link
      break
    case 'youtube':
    case 'vimeo':
      data.type = 'video'
      data.embed = getEmbedCode(link)
      break
    default:
      return null
  }

  return data
}


function getEmbedCode(link) {
  var type = getType(link)

  if (type === 'youtube') {
    var query = qs.parse(link.split('?')[1])
    return util.format(YOUTUBE_EMBED, query.v)
  }
  else if (type === 'vimeo') {
    var match = /http:\/\/vimeo.com\/([^\/]+)/.exec(link)
    return util.format(VIMEO_EMBED, match[1])
  }
}


function postToTumble(form, oauth, done) {
  request.post({
    url: TUMBLR_URL,
    oauth: oauth,
    form: form
  }, function(e, r, b) {
    if (e) {
      logger.error('there was an error posting to tumble', b)
    }
    else {
      logger.info('tumbelised: ', b);
    }
    done(e, r, b)
  })
}


exports.read = read
exports.tumbelise = tumbelise
exports.getType = getType
exports.getEmbedCode = getEmbedCode
exports.createPostData = createPostData
exports.postToTumble = postToTumble


/*
   <iframe src="http://player.vimeo.com/video/34801340" width="500" height="375" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
 */

/*
  <iframe width="420" height="315" src="http://www.youtube.com/embed/7O9y-hKd7Kc" frameborder="0" allowfullscreen></iframe>
 */
