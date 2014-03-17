// public api
exports.id = 'browser.idletime.today'
exports.name = 'Idle Time'
exports.template = 'Idle today: {{timeIdleToday}}'
exports.update = update
exports.on = function(type, listener) {
  events.on(type, listener)
}

// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// idle service
const {Cc,Ci} = require("chrome");
const idleService = Cc["@mozilla.org/widget/idleservice;1"].
                    getService(Ci.nsIIdleService)

function update() {
  // if day changed, clear storage
  var nowDate = new Date()
  if (nowDate.getDate() != storage.lastTimestamp.getDate()) {
    storage.timeIdleToday = 0
  }
  // update last timestamp
  storage.lastTimestamp = nowDate

  events.emit('data', { timeIdleToday: storage.timeIdleToday })
}

// storage
function initializeStorage() {
  var Storage = require('simple-storage').storage
  if (!Storage[exports.id]) {
    Storage[exports.id] = {}
    Storage[exports.id].lastTimestamp = new Date()
    Storage[exports.id].timeIdleToday = idleService.idleTime
  }
  Storage[exports.id].lastTimestamp = new Date(Storage[exports.id].lastTimestamp)
  return Storage[exports.id]
}
var storage = initializeStorage()

var lastTimestamp = null

var idleObserver = {
  observe: function(subject, topic, data) {
    if (topic == 'idle') {
      // TODO: add 1 minute here
      lastTimestamp = new Date()
    }
    else {
      // TODO: wrong. need to track in minutes.
      storage.timeIdleToday += new Date() - lastTimestamp
      update()
    }
  }
};

// get notified each minute
idleService.addIdleObserver(idleObserver, 60); // one minute

// Don't forget to remove the observer using removeIdleObserver!
require('unload').when(function() {
  idleService.removeIdleObserver(idleObserver, 10);
});
