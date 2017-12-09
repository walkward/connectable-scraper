/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@dsub}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = ''
  // If string contains VGA
  if (/D[-\s]?Sub/gi.test(value)) {
    newValue = ports.dSub.types.default.name
  }
  return newValue
}
