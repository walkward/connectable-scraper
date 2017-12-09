/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@firewire}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = ''
  // Default firewire matching. For ports that are unclear about the pin configuration.
  if (/1394|Firewire/gi.test(value) && !/Pin|400|800/gi.test(value)) {
    newValue = ports.firewire.types.default.name
  }
  return newValue
}
