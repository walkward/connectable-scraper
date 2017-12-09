/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@dvi]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  if (/Dual[-\s]?Link|29/gi.test(value) && /DVI[-\s]?D/gi.test(value)) {
    newValue = ports.dvi.types.dviDDual.name
  } else if (/DVI[-\s]D/gi.test(value) && !/Dual|29/gi.test(value)) {
    // If string contains DVI-D
    newValue = ports.dvi.types.dviDSingle.name
  } else if (/DVI/gi.test(value)) {
    // If string contains DVI
    newValue = ports.dvi.types.default.name
  }
  return newValue
}
