/**
 * Identification Section
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@bluetooth}
 */

const wireless = require('../../schema/Wireless')

module.exports = function (value) {
  let newValue = ''
  // Checking if Bluetooth exists & specify's its version.
  // Should match Bluetooth V4.0 & Bluetooth 4.0, but only returns bluetooth without 'V'
  if (/Bluetooth|BT/i.test(value) && /([V]|\b)\d\.\d\b/.test(value)) {
    newValue = 'Bluetooth ' + value.match(/\d\.\d/)
  } else if (/Bluetooth/gi.test(value)) {
    // Checking if Bluetooth string has a positive sentiment (without specifying version)
    newValue = wireless.bluetooth.types.default.name
  }
  return newValue
}
