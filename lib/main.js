/*

Reflector Plug-in API:

* plug-ins implement the event emitter API.
* plug-ins emit a 'data' event, which is an object. eg: thing.on('message', function(data) { console.log(data.someProperty) })
* label is a mustache template for formatting the data
* NOT IMPLEMENTED: plug-ins can expose configurable preferences, which are available as keys of thing.configuration.
* NOT IMPLEMENTED: if a plug-in requires configuration and is not configured, the 'data' event will return an error immediately to listeners.

Implementing a plugin:

// emits 'data' event when data is available
exports.on = function(type, listener) {
  events.on(type, listener)
}

// manually trigger an update instead of
// waiting for first event
exports.update = update

// unique id for the plugin
exports.id = 'browser.opentabs'

// descriptive title for display
exports.name = 'Open Tabs'

// mustache template for optional use when
// displaying the data
exports.template = 'Open tabs: {{tabCount}}'

Usage:

var plugin = [r]equire('reflector.thing.js')
plugin.on('data', function(data) {
  document.write(Mustache.to_html(plugin.label, data))
});


TODO
* figure out whether to push daily or individual events
* push data storage events to Firebase
* update plugin docs
* plugin error handling (error parameter in event handler like node?)
* implement preferences
* support multiple widgets per plugin

Browser data to track:
- all typed text in form fields (word cloud viz)
- box with number of link clicks (time-series graphed underneath)
- number of searches in search box
- number of selections from awesomebar
- box with urls spent most time at

BADGES

*/

// Reflector storage - wrap SDK Storage, add events
function LocalStorage() {
  require('EventEmitter').EventEmitter.call(this)
  // Setup storage - key/value pair of plugin id and data
  var Storage = require('sdk/simple-storage').storage
  if (!Storage.current)
    Storage.current = {}
  this.storage = Storage.current
}
LocalStorage.prototype = {
  get: function(id) {
    return this.storage[id] || {} 
  },
  // TODO: add something which updates the widget definition
  // for future stuff like remote updating.
  update: function(msg) {
    var oldVal = this.storage[msg.id]
    if (oldVal) {
      if (!this.storage[msg.id].values)
        this.storage[msg.id].values = []
      this.storage[msg.id].values.push({
        data: msg.data,
        timestamp: Date.now()
      })
    }
    else {
      this.storage[msg.id] = msg
      this.storage[msg.id].values = [{
        data: msg.data,
        timestamp: Date.now()
      }]
    }
    this.emit('update', msg)
  }
}

// initialize data storage
var localStorage = new LocalStorage();

// id->widget
var widgets = {}

// UI stuff
var {Mustache} = require('mustache'),
    {Widget} = require('sdk/widget')

// update/add widgets on data available
localStorage.on('update', function(msg) {
  //console.log('update', msg)
  var html = Mustache.to_html(msg.template, msg.data)

  // update ui
  if (widgets[msg.id]) {
    widgets[msg.id].contentURL = getFormattedContent(html)
  }
  // add ui
  else {
    widgets[msg.id] = Widget({
      id: 'reflector-' + Date.now(),
      label: msg.name,
      contentURL: getFormattedContent(html)
    })
  }

  // dynamic width
  widgets[msg.id].width = html.length * 6.2
})

// helper to turn data into styled html data URI
function getFormattedContent(msg) {
  return 'data:text/html,<div style="color: black; background-color: white; padding-left: 2px;">'+ msg + '</div>'
}

// load and initialize plugins
var plugins = [];

plugins.push(require('reflector.opentabs.js'));
plugins.push(require('reflector.tabs.js'));
plugins.push(require('reflector.places.js'));
//plugins.push(require('reflector.idletime.js'));
//plugins.push(require('reflector.todaystweets.js'));
//plugins.push(require('reflector.nikefuelband.js'));
//plugins.push(require('reflector.fitbit.js'));

plugins.forEach(function(plugin) {
  plugin.on('data', function(data) {
    localStorage.update({
      id: plugin.id,
      name: plugin.name,
      template: plugin.template,
      data: data
    })
  })

  // initial update
  plugin.update()
})
