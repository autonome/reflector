// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// public api
exports.on = function(type, listener) {
  events.on(type, listener)
}
exports.update = update
exports.id = 'twitter.tweets.todaycount'
exports.name = 'Tweets Today'
exports.template = 'Tweets today: {{tweetsToday}}'

const request = require('request'),
      timers   = require('timers')

function searchTwitter(searchURL, callback) {
    var Request = require("request").Request
    Request({
      url: searchURL,
      onComplete: callback
    }).get()
}


function numberOfTweetsToday(callback) {
  var date = (new Date()).toLocaleFormat("%Y-%m-%d")
  var searchURL = 'http://search.twitter.com/search.json?q=from:dietrich%20since:' + date
  searchTwitter(searchURL, function(response) {
      callback(response.json.results.length)
  })
}

function update() {
  numberOfTweetsToday(function(count) {
    events.emit('data', {tweetsToday: count})
  })
}

// update every 5 minutes
timers.setInterval(update, 5 * 60 * 1000)
