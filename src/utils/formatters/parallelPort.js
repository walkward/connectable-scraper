/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {Boolean}
 */

module.exports = function (value) {
  let newValue = false
  // If string contains VGA
  if (/Parallel/gi.test(value) && /Port/gi.test(value) && !/Ata|600/gi.test(value)) {
    newValue = true
  }
  return newValue
}
