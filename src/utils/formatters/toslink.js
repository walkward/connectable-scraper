/**
 * Identification Module
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@toslink]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'
  // Checking if Audio string includes TOSLINK without any terms that would indicate
  // that this was a Mini-TOSLINK (Which are compatible with some 3.5mm Stero Jacks)
  if (/TOSLINK/gi.test(value) && !/3\.5|Mic|Head|Comb/gi.test(value)) {
    newValue = ports.toslink.types.default.name
  }
  // Should match any strings which contain Either Optical & Combo/Combined or TOSLINK & Combo/Combined
  // Strings that match these two parameters are normally listed as 3.5mm Stereo Jacks
  if (/TOSLINK/gi.test(value) && /\boptical\b|\bcomb\b/gi.test(value)) {
    newValue = ports.toslink.types.mini.name
  }
  return newValue
}
