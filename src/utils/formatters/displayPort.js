/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@displayPort]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // Should match strings that Contain mDP or Mini DisplayPort
  if (/\bDisplay[\s]?Port\b/gi.test(value) && /\bMini\b|\bmDP\b/gi.test(value)) {
    newValue = ports.displayPort.types.mini.name
  }
  // Should match strings that do not contain Mini or mDP, but do contain DisplayPort
  if (!/Mini.D|mDP/gi.test(value) && /Display[\s]?Port/gi.test(value)) {
    newValue = ports.displayPort.types.default.name
  }
  return newValue
}
