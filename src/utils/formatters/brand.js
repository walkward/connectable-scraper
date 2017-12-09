/**
 * Brand Identification
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {@Brands!}
 */

const brands = require('../../schema/Brands')

module.exports = function (string) {
  let newValue = ''

  // Looping through brand schema to check for match.
  for (var brand in brands) {
    let matchString = brands[brand].name
    let re = new RegExp('^(?:' + matchString + ')', 'i')
    if (re.test(string)) {
      brandName = brands[brand].name
    }
  }

  // If we didn't find an exact match, we're going to loop through the
  // brand aliases to see if there is a match for any other names.
  if (brandName === null) {
    for (var brand in brands) {
      for (var alias in brands[brand].aliases) {
        let re = new RegExp('^(?:' + brands[brand].aliases[alias] + ')', 'i')
        if (re.test(string)) {
          brandName = brands[brand].aliases[alias]
        }
      }
    }
  }

  return brandName
}
