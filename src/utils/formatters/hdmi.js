/**
 * Identification Section
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@hdmi]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  if (/Mini/gi.test(value) && /HDMI/gi.test(value)) {
    newValue = ports.hdmi.types.typeC.name
  } else if (/Micro/gi.test(value) && /HDMI/gi.test(value)) {
    newValue = ports.hdmi.types.typeD.name
  } else if (/HDMI/gi.test(value) && !/Micro|Mini/gi.test(value)) {
    newValue = ports.hdmi.types.typeA.name
  }
  return newValue
}
