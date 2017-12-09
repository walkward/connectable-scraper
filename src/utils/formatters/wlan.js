/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[String]}
 */

const _ = require('lodash')

module.exports = function (value) {
  let newValue = ''
  // If string contains VGA
  if (/802\.11[\s]?([acbgn/])*/gi.test(value)) {
    newValue = _.chain(value.match(/802\.11[\s]?([acbgn/])*/gi)).toLower().replace(' ', '').value()
  }
  return newValue
}
