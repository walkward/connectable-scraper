/**
 * Master Validation
 * -------------
 * All scrapers need to pass this validation in order to be written to datastore.
 * Error should be thrown and process exited for objects that do not pass validation.
 * @kind {@Brands!} brand
 * @kind {String!} model
 * @kind {String} series
 * @kind {String} partNumber             - The manufacturerers part number (Not to be confused with the suppliers/scraped page part number)
 * @kind {Date!} dateUpdated             - The date when the page was scraped. Should be updated after each scrape.
 * @kind {Url} image                     - Should be a properly formatted url (including protocol)
 * @kind {String} category               - Defaults to the category name unless the scraped page provides more descriptive category.
 * @kind {[String]} wlan                 - The 802.11 Specification
 * @kind {String} acAdapter
 * @kind {@bluetooth} bluetooth
 * @kind {[@hdmi]} hdmi
 * @kind {[@usb]} usb
 * @kind {[@displayPort]} displayPort
 * @kind {[@vga]} vga
 * @kind {@dSub} dSub
 * @kind {@thunderbolt} thunderbolt
 * @kind {@primaryPower} primaryPower
 * @kind {[@dvi]} dvi
 * @kind {[@toslink]} toslink
 * @kind {[@stereoJack]} stereoJack
 * @kind {[@sata]} sata
 * @kind {[@rca]} rca
 * @kind {@firewire} firewire
 * @kind {Boolean} spdif
 * @kind {Boolean} serialPort
 * @kind {Boolean} parallelPort
 * @kind {Boolean} esata
 * @kind {Boolean} dockingPort
 * @kind {Boolean} ir
 * @kind {Boolean} rj45
 * @kind {Url!} scrapedUrl                 - Url of the page scraped
 * @kind {Url!} scrapedHost                - Host basename for the page scraped
 * @kind {Object!} scrapedArchive          - The original object used to scrape data.
 */

const chalk = require('chalk')
const _ = require('lodash')
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true, verbose: true, useDefaults: true })
var Promise = require('bluebird')

const schema = {
  'type': 'object',
  'properties': {
    'brand': {
      'type': ['string']
    },
    'model': {
      'type': ['string']
    },
    'series': {
      'type': ['string', 'null'],
      'default': null
    },
    'partNumber': {
      'type': ['string', 'null'],
      'default': null
    },
    'dateUpdated': {
      'type': 'string',
      'default': JSON.stringify(new Date())
    },
    'image': {
      'type': ['string', 'null'],
      'default': null,
      /* eslint-disable no-useless-escape */
      'format': 'uri'
      /* eslint-enable no-useless-escape */
    },
    'category': {
      'type': ['string', 'null'],
      'default': null
    },
    'wlan': {
      'type': ['array'],
      'default': [null]
    },
    'acAdapter': {
      'type': ['string', 'null'],
      'default': null
    },
    'bluetooth': {
      'type': ['string', 'null'],
      'default': null
    },
    'hdmi': {
      'type': ['array'],
      'default': [null]
    },
    'usb': {
      'type': ['array'],
      'default': [null]
    },
    'displayPort': {
      'type': ['array'],
      'default': [null]
    },
    'vga': {
      'type': ['array'],
      'default': [null]
    },
    'dSub': {
      'type': ['string', 'null'],
      'default': null
    },
    'thunderbolt': {
      'type': ['string', 'null'],
      'default': null
    },
    'primaryPower': {
      'type': ['string', 'null'],
      'default': null
    },
    'dvi': {
      'type': ['array'],
      'default': [null]
    },
    'toslink': {
      'type': ['array'],
      'default': [null]
    },
    'rca': {
      'type': ['array'],
      'default': [null]
    },
    'stereoJack': {
      'type': ['array'],
      'default': [null]
    },
    'sata': {
      'type': ['array'],
      'default': [null]
    },
    'firewire': {
      'type': ['string', 'null'],
      'default': null
    },
    'spdif': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'dockingPort': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'serialPort': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'parallelPort': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'esata': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'ir': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'rj45': {
      'type': ['boolean', 'null'],
      'default': null
    },
    'scrapedUrl': {
      'type': 'string'
    },
    'scrapedHost': {
      'type': 'string'
    },
    'scrapedArchive': {
      'type': 'object'
    }
  },
  'required': ['brand', 'model']
}

const validate = ajv.compile(schema)

/**
 * Custom defaults that are not made possible using AJV
 * @param  {Object!} object The entire product object which will later be saved to db
 * @return {Object}         The new object
 */
function customDefaults (object) {
  const newObject = _.clone(object)
  _.each(object, (val, key) => {
    // Checking for objects that have no values
    if (_.size(val) === 0 && val !== null && _.isObject(val)) {
      newObject[key] = [null]
    }
    // Remove 'none' values for arrays that have greater than 1 value
    if (_.size(val) > 1 && _.includes(val, 'none') && _.isObject(val)) {
      newObject[key] = _.without(val, 'none')
    }
    // Blank strings indicate that we have checked for a value but haven't found one.
    // We'll indicate this by setting the value to none.
    if (_.isString(val) && val === '') {
      newObject[key] = 'none'
    }
  })
  return newObject
}

module.exports = function (data) {
  return new Promise((resolve, reject) => {
    // Transform any empty arrays into [null]
    data = customDefaults(data)

    // Check if data is value
    const valid = validate(data)

    // First off we are going to check if model or brand are missing. These are essential before validation.
    if (typeof data.model === 'undefined' || typeof data.brand === 'undefined' || data.model === null || data.brand === null) {
      console.log(chalk.keyword('orange')('Missing Model/Brand => ' + data.scrapedUrl))
      resolve(false)
    } else if (valid) {
      resolve(data)
    } else {
      console.log(chalk.dim('Scraped URL => ' + data.scrapedUrl))
      console.log(chalk.dim('Error Obj => ' + JSON.stringify(data, 0, 2)))
      console.log(chalk.red('Model => ' + ajv.errorsText(validate.errors)))
      Error('Invalid: ' + ajv.errorsText(validate.errors))
      // Get that shit out!
      process.exit(1)
    }
  })
}
