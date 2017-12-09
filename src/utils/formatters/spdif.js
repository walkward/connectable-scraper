/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {Boolean}
 */

module.exports = function (value) {
  let newValue = false
  // Checking if S/PDIF Exists
  if (/S[/]?PDIF/gi.test(value)) {
    newValue = true
  }
  return newValue
}
