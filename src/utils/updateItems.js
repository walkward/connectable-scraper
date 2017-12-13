/**
 * Save to datastore.
 * -----------------
 */

const Datastore = require('@google-cloud/datastore')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const _ = require('lodash')
var ldj = require('ldjson-stream')
var Promise = require('bluebird')

const datastore = Datastore({projectId: 'gizmo-gild', keyFilename: path.resolve('./config/service-account-key.json')})
const settings = {
  datastoreKind: 'items'
}

let items = []
let requests = 0

/**
 * Batch Save Entities
 * @param  {[Object!]} entities
 * @return {Object}
 */
function saveEntities (entities) {
  // Remove any duplicates
  entities = _.uniqBy(entities, (n) => { return n.key.name })

  return new Promise((resolve, reject) => {
    datastore.save(entities).then((msg) => {
      // Logging the save results
      console.log(chalk.green(JSON.stringify(msg)))
      resolve(msg)
    }).catch((err) => {
      reject(err)
    })
  })
}

fs.createReadStream(path.resolve('./data/items.json'))
  .pipe(ldj.parse())
  .on('data', function (obj) {
    return new Promise((resolve, reject) => {
      const entityName = obj.id
      const productKey = datastore.key([settings.datastoreKind, entityName])

      // Assign the data from the product object to our new datastore entity.
      const newProduct = {
        key: productKey,
        data: obj
      }

      items.push(newProduct)

      if (items.length >= 1) {
        let entities = items
        // resetting the items array
        items = []
        // Batch save the entity's we're working with
        Promise.delay(++requests * 500).then(() => {
          saveEntities(entities).then((msg) => {
            resolve(msg)
          })
        })
      }
    })
  })
