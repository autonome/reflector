// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// query Places for today's history
var history = require('sdk/places/history')
function getTodaysHistoryCount(func) {
  var today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)

  var end = Date.now()
  history.search({
    from: today
  }).on('end', function(results) {
    func(results)
  })
}

function update() {
  getTodaysHistoryCount(function(entries) {
    events.emit('data', {pagesToday: entries.length})
  })
}

// history listener for updating on visit
var historyObserver = {
  onBeginUpdateBatch: function() {},
  onEndUpdateBatch: function() {},
  onVisit: update,
  onTitleChanged: function(aURI, aPageTitle) {},
  onBeforeDeleteURI: function(aURI) {},
  onDeleteURI: function(aURI) {},
  onClearHistory: function() {},
  onPageChanged: function(aURI, aWhat, aValue) {},
  onDeleteVisits: function() {}
}

const {Cc, Ci, Cr, Cu} = require("chrome")
Cu.import('resource://gre/modules/PlacesUtils.jsm', this)
PlacesUtils.history.addObserver(historyObserver, false)
require('sdk/system/unload').when(function() {
  PlacesUtils.history.removeObserver(historyObserver, false)
})

// public api
exports.on = function(type, listener) {
  events.on(type, listener)
}
exports.update = update
exports.id = 'browser.pages.today'
exports.name = 'Places: Pages Today'
exports.template = 'Pages today: {{pagesToday}}'
