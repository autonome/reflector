// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// public api
exports.on = function(type, listener) {
  events.on(type, listener)
}
exports.id = 'fitbit.aria'
exports.update = update
exports.name = 'Fitbit - Weight & Body Fat Percentage'
exports.template = 'Fitbit - Weight: {{weight}}, %25Fat: {{fat}}'

function update() {
  var pageWorker = require("page-worker").Page({
    contentURL: "https://www.fitbit.com/",
    contentScript: "var weight = document.querySelector('div.weightText b').innerHTML; var fat = document.querySelector('div.fatText b').innerHTML; self.postMessage({weight: weight, fat: fat});",
    onMessage: function(msg) {
      events.emit('data', msg)
      pageWorker.destroy();
    }
  });
}

// update every 5 minutes
require('timers').setInterval(update, 5 * 60 * 1000)
