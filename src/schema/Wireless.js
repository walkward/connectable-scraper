/**
 * Wireless Connections
 * ------------
 * This file should always be referred to when scraping items. Scraped
 * items should not use terms described outside of this object.
 * @namespace wireless
 * @property {String}
 */

module.exports = {
  bluetooth: {
    types: {
      default: {
        name: "Bluetooth"
      },
      bluetooth30: {
        name: "Bluetooth 3.0"
      },
      bluetooth40: {
        name: "Bluetooth 4.0"
      },
      bluetooth41: {
        name: "Bluetooth 4.1"
      },
      bluetooth42: {
        name: "Bluetooth 4.2"
      },
      bluetooth50: {
        name: "Bluetooth 5.0"
      }
    }
  }
}
