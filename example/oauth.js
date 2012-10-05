"use strict";

var request = require('request')
var qs = require('querystring')
var util = require('util')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')
var logger = require('nlogger').logger(module)

var POOR_DB_PATH = path.normalize(__dirname + '/../tmp/oauth_tokens')


module.exports = {
  /**
   * initialises the object.
   * @param {object} opts options for the oauth object
   *   @param {string} opts.request_url
   *   @param {string} opts.access_url
   *   @param {string} opts.authorize_url
   *   @param {string} opts.callback_url
   *   @param {string} opts.consumer_key
   *   @param {string} opts.consumer_secret
   */
  init: function(opts) {
    if (!opts) throw new TypeError('no options were passed in')
    _.extend(this, opts)
  },

  getRequestToken: function rt(done) {
    var that = this;

    // we check whether we can get the file
    fs.readFile(POOR_DB_PATH, 'utf-8', function(e, data) {
      // if the file does not exist, we make a request for the tokens
      if (e) {
        logger.info('token file retrieval not successful', e)
        req.call(that)
      }
      //  else we call the callback
      else {
        callback.call(that, e, null, data)
      }
    })

    var callback = function(err, r, body) {
      if (err) {
        done(err, null)
      }
      else {
        var tokens = qs.parse(body)
        this.tokens = {
          token: tokens.oauth_token,
          token_secret: tokens.oauth_token_secret
        }
        done(err, this.tokens, !r) // if the response was null, we got the tokens from the file
      }
    }

    var req = function req() {
      request.post({
        url: this.request_url,
        oauth: {
          callback: this.callback_url,
          consumer_key: this.consumer_key,
          consumer_secret: this.consumer_secret
        }
      }, callback.bind(this))
    }
  },

  getAuthorizeUrl: function() {
    return util.format(this.authorize_url, this.tokens.token);
  },

  getAccessToken: function(done) {
    var callback = function(e, r, body) {
      if (e) {
        done(e, null, null)
        return
      }

      var tokens = qs.parse(body)

      fs.writeFile(POOR_DB_PATH, body, function(err) {
        if (err) logger.warn('could not save tokens', err)
        else logger.info('tokens saved')
      })

      this.tokens = {
        token: tokens.oauth_token,
        token_secret: tokens.oauth_token_secret
      }

      this.user = {
        screen_name: tokens.screen_name,
        user_id: tokens.user_id
      }

      done(e, this.tokens, this.user)
    }

    request.post({
      url: this.access_token_url,
      oauth: {
        consumer_key: this.consumer_key,
        consumer_secret: this.consumer_secret,
        verifier: this.verifier,
        token: this.tokens.token,
        token_secret: this.tokens.token_secret
      }
    }, callback.bind(this))
  },

  setVerifier: function(verifier) {
    this.verifier = verifier
    return this
  },

  getOauthSignature: function() {
    if (!this.oauth) {
      this.oauth = {
        consumer_key: this.consumer_key,
        consumer_secret: this.consumer_secret,
        token: this.tokens.token,
        token_secret: this.tokens.token_secret
      }
    }

    return this.oauth;
  }

}
