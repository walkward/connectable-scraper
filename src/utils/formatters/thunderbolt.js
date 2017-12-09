/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@thunderbolt}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = ''
  // Checking if the string contains Thunderbolt 1 @TODO Figure out how we should match plain "Thunderbolt" ports
  if (/Thunderbolt[\s]?1/gi.test(value)) {
    newValue = ports.thunderbolt.types.thunderbolt1.name
  }
  // Checking if the string contains Thunderbolt 2
  if (/Thunderbolt[\s]?2/gi.test(value)) {
    newValue = ports.thunderbolt.types.thunderbolt2.name
  }
  // Checking if the string contains Thunderbolt 3
  if (/Thunderbolt[\s]?3/gi.test(value)) {
    newValue = ports.thunderbolt.types.thunderbolt3.name
  }
  return newValue
}
