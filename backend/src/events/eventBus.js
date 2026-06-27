// Node.js EventEmitter singleton (pub/sub bus)
const EventEmitter = require("events");

class EventBus extends EventEmitter {}

module.exports = new EventBus();
