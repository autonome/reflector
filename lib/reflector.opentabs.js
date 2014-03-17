// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// public api
// emits 'data' when data is available
exports.on = function(type, listener) {
  events.on(type, listener)
}
exports.update = update
exports.id = 'browser.opentabs'
exports.name = 'Open Tabs'
exports.template = 'Open tabs: {{tabCount}}'

var tabs = require('sdk/tabs');

function getTabCount(callback) {
    callback(tabs.length)
}

function update() {
  // hack.
  require('sdk/timers').setTimeout(function() {
    getTabCount(function(tabCount) {
      events.emit('data', {tabCount: tabCount})
    })
  }, 100)
}

tabs.on('open', update)
tabs.on('close', update)

