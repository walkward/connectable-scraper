/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {Boolean}
 */

module.exports = function (value) {
  let newValue = false
  // If string contains e-SATA
  if (/e[-\s]?SATA/gi.test(value)) {
    return true
  }
  return newValue
}
