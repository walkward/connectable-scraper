/**
 * Deletes the values for a given key
 * -------------
 * @param {String!} namespace The entity namespace to be updated
 * @param {String!} kind      The entity kind to be updated
 * @param {String!} key       The entity key to be deleted
 *
 * Sample Command: npm run delete:prop -- --namespace=Product --kind=Laptop --key=audio
 */

"use strict";

const Datastore = require('@google-cloud/datastore');
const argv = require('minimist')(process.argv.slice(2));

const datastore = Datastore({
  projectId: 'gizmo-gild',
  keyFilename: './config/service-account-key.json'
});

// Creating a query that returns 500 entity's with the given key
const query = datastore.createQuery(argv.namespace, argv.kind)
  .filter(argv.key, '>', 0)
  .limit(500);

datastore.runQuery(query)
.then((results) => {
  const items = results[0];

  // Map an array of entity updates
  let keys = items.map(function(item) {
    delete item[argv.key];

    return {
      key: item[datastore.KEY],
      data: item
    };
  });

  // Batch save the entity's we're working with
  datastore.save(keys, function(err, apiResponse) {
    console.log(err);
    console.log(apiResponse);
  });

});
