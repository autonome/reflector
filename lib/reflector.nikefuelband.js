// set up events support
var {EventEmitter} = require('EventEmitter')
function events() {}
EventEmitter.call(events)

// public api
exports.on = function(type, listener) {
  events.on(type, listener)
}
exports.id = 'nike.fuelband'
exports.update = update
exports.name = 'Nike+ Fuel'
exports.label = 'Nike+ Fuel: {{fuel}}'

function update() {
  var pageWorker = require("page-worker").Page({
    contentURL: "http://nikeplus.nike.com/plus/home/Autonome",
    contentScript: "var fuel = document.querySelector('.fuel_center_text span'); self.postMessage(fuel?fuel.innerHTML:0);",
    onMessage: function(count) {
      events.emit('data', {fuel: count})
      pageWorker.destroy();
    }
  });
}

// update every 5 minutes
require('timers').setInterval(update, 5 * 60 * 1000)
