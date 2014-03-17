// public api
exports.id = 'browser.tabs.activity.today'
exports.name = 'Tab Activity'
exports.template = 'Tab open/close/switch: {{opened}}/{{closed}}/{{switched}}'
exports.update = update
exports.on = function(type, listener) {
  events.on(type, listener)
}

// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// storage
function initializeStorage() {
  var Storage = require('sdk/simple-storage').storage
  if (!Storage[exports.id]) {
    Storage[exports.id] = {}
    Storage[exports.id].lastTimestamp = new Date()
    Storage[exports.id].counts = {
      switched: 0,
      opened: 0,
      closed: 0
    }
  }
  Storage[exports.id].lastTimestamp = new Date(Storage[exports.id].lastTimestamp)
  return Storage[exports.id]
}
var storage = initializeStorage()

// event listeners
var tabs = require('sdk/tabs')

tabs.on('activate', function(tab) {
  storage.counts.switched++
  update()
})

tabs.on('open', function() {
  storage.counts.opened++
  // don't count new tabs as both opened and tab switch
  storage.counts.switched--
  update()
})

tabs.on('close', function() {
  storage.counts.closed++
  update()
})

function update() {
  // if day changed, clear storage
  var nowDate = new Date()
  if (nowDate.getDate() != storage.lastTimestamp.getDate()) {
    storage.counts.switched = 0
    storage.counts.opened = 0
    storage.counts.closed = 0
  }
  // update last timestamp
  storage.lastTimestamp = nowDate

  // hack
  require('sdk/timers').setTimeout(function() {
    events.emit('data', storage.counts)
  }, 50)
}
