/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@stereoJack]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // Checking if TRRS Exists
  if (/Mic|Combo|Headset/gi.test(value)) {
    newValue = ports.stereoJack.types.trrs35m.name
  }
  // Checking if TRS Exists
  if (/Headphone|3\.5|Line[\s-]?Out/gi.test(value) && !/Mic|Combo|Headset/gi.test(value)) {
    newValue = ports.stereoJack.types.trs35m.name
  }
  // Checking if Line-In Esists
  if (/Line[\s-]?In/gi.test(value) && !/Mic|Combo|Headset/gi.test(value)) {
    newValue = ports.stereoJack.types.stereoIn.name
  }
  return newValue
}
