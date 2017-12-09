/**
 * Identification Section
 * -----------------
 * The following operations should match items without any respect for order of execution.
 * @kind {[@usb]}
 */

const ports = require('../../schema/Ports')

module.exports = function (value) {
  let newValue = 'none'

  // USB eSATA identification
  // Should match strings that include both eSATA & USB
  if (/e[-]?SATA/g.test(value) && /USB/gi.test(value)) {
    newValue = ports.eSata.types.default.name
  }

  // Mini DisplayPort USB identification
  // Should match strings that include both Mini DisplayPort & USB
  if (/Mini(?!.*DisplayPort)/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.displayPort.types.mini.name
  }

  // USB DisplayPort Support identification
  // Should match strings that include both DisplayPort & USB
  if (/Display[\s]?Port/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.displayPort.types.default.name
  }

  // USB Micro-B identification
  // Should match strings that include both Micro-B & USB
  if (/Micro[-\s]?B/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.usb.types.microB.name
  }

  // USB Type-A identification
  // Should match strings that include the word 'USB' & do not include words that would
  // specify any type other than type-a. Designed to catch strings that imply type-a.
  if (!/Micro|Mini|Thunderbolt/gi.test(value) && !/[-]C(?![A-z])[\s)]?|Type[-\s][C]/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.usb.types.typeA.name
  }

  // Type-C identification
  if (/[-]C(?![A-z])[\s)]?|Type[-\s][C]/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.usb.types.typeC.name
  }

  // 'Thunderbolt 3' identification
  // Should match strings that include both 'USB' and 'Thunderbolt', thus implying type-c
  // compatible thunderbolt port.
  if (/Thunderbolt/gi.test(value) && /USB/gi.test(value)) {
    newValue = ports.thunderbolt.types.thunderbolt3.name
  }

  // Version identification
  // if(/\d\.\d/g.test(value)){
  //   newValue.usbVersion = value.match(/\d\.\d/g)[0];
  // }
  // Power identification
  // if(/Power|Charg/gi.test(value)){
  //   newValue.usbPower = true;
  // }
  return newValue
}
