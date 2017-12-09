/**
 * Save to datastore.
 * -----------------
 */

const Datastore = require('@google-cloud/datastore')
const crypto = require('crypto')
const chalk = require('chalk')
const _ = require('lodash')
const masterValidate = require('../schema/Master')
var Promise = require('bluebird')

const datastore = Datastore({projectId: 'gizmo-gild', keyFilename: '../../../config/service-account-key.json'})

let items = []
let delaySaving

/**
 * Batch Save Entities
 * @param  {[Object!]} entities
 * @return {Object}
 */
function saveEntities (entities) {
  // Remove any duplicates
  entities = _.uniqBy(entities, (n) => { return n.key.name })

  return new Promise((resolve, reject) => {
    // @TODO Needs to incorporate the --overwrite options which will allow for datastore 'saving' instead of 'inserting'
    datastore.insert(entities).then((msg) => {
      // Logging the save results
      console.log(chalk.green(JSON.stringify(msg)))
      resolve(msg)
    }).catch((err) => {
      reject(err)
    })
  })
}

module.exports = function (product, settings) {
  return new Promise((resolve, reject) => {
    // Validate object
    masterValidate(product)
      .then((product) => {
        // Do not save the product if masterValidate returns false.
        // This normally indicates that an essential value such as Brand/Model is missing
        if (product === false) { return false }
        // Creating a product id which uses the model # by default, but will use the partnumber
        // instead if it is available
        let entityName = crypto.createHash('md5').update(product.scrapedUrl).digest('hex')

        const productKey = datastore.key({
          namespace: settings.datastoreNamespace,
          path: [settings.datastoreKind, entityName]
        })

        // Assign the data from the product object to our new datastore entity.
        const newProduct = {
          key: productKey,
          data: product
        }

        // Push the product into our array of entities
        items.push(newProduct)

        if (items.length >= 100 && settings.mode !== true) {
          let entities = items
          // resetting the items array
          items = []
          // Batch save the entity's we're working with
          saveEntities(entities)
            .then((msg) => {
              // resetting the items array
              resolve()
            })
            .catch((err) => {
              reject(err)
            })
        } else if (settings.mode !== true) {
          // Reset the delay Saving function. This is designed to trigger a save without knowing
          // how many pages still need to be scraped.
          clearTimeout(delaySaving)
          // Delay saving function is called after every 10 seconds of not receiving any more items.
          // This is designed to submit the last batch of products without knowing how many items are
          // left in the scrape queue
          delaySaving = setTimeout(() => {
            let entities = items
            // resetting the items array
            items = []
            saveEntities(entities)
            console.log(chalk.red('Timout Called'))
          }, 10000)
          resolve()
        } else {
          // Print the object to be written if we aren't running the script in save mode.
          console.log(chalk.keyword('cyan')(JSON.stringify(product, null, 2)))
          resolve()
        }
      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  })
}
