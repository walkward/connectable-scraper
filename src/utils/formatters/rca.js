/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@rca]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // Check for Component & RCA in the same string
  if (/RCA/gi.test(value) && /Component/gi.test(value)) {
    newValue = ports.rca.types.component.name
  }
  // Check for Composite & RCA in the same string
  if (/RCA/gi.test(value) && /composite/gi.test(value)) {
    newValue = ports.rca.types.composite.name
  }
  return newValue
}
