/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@sata]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // If string contains Serial ATA without any digits (which would indicate the type)
  if (/Serial[\s-]ATA/gi.test(value) && !/\d/gi.test(value)) {
    newValue = ports.sata.types.default.name
  } else if (/Serial[\s-]ATA/gi.test(value) && /150/gi.test(value)) {
    newValue = ports.sata.types.sata150.name
  } else if (/Serial[\s-]ATA/gi.test(value) && /300/gi.test(value)) {
    newValue = ports.sata.types.sata300.name
  } else if (/Serial[\s-]ATA/gi.test(value) && /600/gi.test(value)) {
    newValue = ports.sata.types.sata600.name
  }
  return newValue
}
