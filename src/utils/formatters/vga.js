/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@vga}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // If string contains VGA
  if (/VGA/gi.test(value)) {
    newValue = ports.vga.types.default.name
  }
  return newValue
}
