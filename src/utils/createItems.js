/**
 * Creates an array of keywords to be used for search
 * -------------
 * @param {String!} namespace The entity namespace to be updated
 * @param {String!} kind      The entity kind to be updated
 * @param {String!} key       The entity key to be deleted
 *
 * Sample Command: node createTitle.js --namespace=Product --kind=Laptop
 */

 "use strict";

 var Promise = require('bluebird');
 const _ = require('lodash');
 const Datastore = require('@google-cloud/datastore');
 const argv = require('minimist')(process.argv.slice(2));
 const crypto = require('crypto');

 const datastore = Datastore({
   projectId: 'gizmo-gild',
   keyFilename: './config/service-account-key.json'
 });

 let offset = 0;

 function processData(){
   return new Promise((resolve, reject) => {
     // Creating a query that returns 500 entity's with the given key
     const query = datastore.createQuery(argv.namespace, argv.kind)
       // .filter(argv.key, '=', 0)
       .offset(offset)
       .limit(500);

     datastore.runQuery(query)
     .then((results) => {
       const items = results[0];
       const itemCount = items.length;

       // Map an array of entity updates
       let keys = items.filter(function(item) {
         if (typeof item.brand !== 'undefined' && typeof item.model !== 'undefined') {
           return true;
         } else {
           return false;
         }
       })
       .map(function(item) {
         let newItem = {};
         newItem.title = '';
         newItem.type = argv.kind;
         newItem.keywords = item.keywords;

         if(typeof item.brand !== 'undefined'){
           newItem.brand = item.brand;
           newItem.title = item.brand;
         }
         if(typeof item.series !== 'undefined'){
           newItem.series = item.series;
           newItem.title = newItem.title + ' ' + item.series;
         }
         if(typeof item.model !== 'undefined'){
           newItem.model = item.model;
           newItem.title = newItem.title + ' ' + item.model;
         }
         if(typeof item.partNumber !== 'undefined'){
           newItem.partNumber = item.partNumber;
         }
         if(typeof item.image !== 'undefined'){
           newItem.image = item.image;
         }

         // Creating an itemId using the brand + model
         let itemId = crypto.createHash('md5').update(item.brand + ' ' + item.model).digest("hex");

         const newItemKey = datastore.key({
           namespace: 'Product',
           path: ['Item', itemId]
         });

         console.log(newItem)

         return {
           key: newItemKey,
           data: newItem
         };
       });

       // Making sure keys are unique
       // keys = _.uniqBy(keys, '');

       // Batch save the entity's we're working with
       if (typeof argv.dry === 'undefined'){
         datastore.save(keys, function(err, apiResponse) {
           console.log(err);
           console.log(apiResponse);
         });
       }

       if (itemCount === 500){
         offset = offset + 500;
         processData()
       } else {
         resolve(itemCount);
       }

     });
   });
 }

 processData().then((count) => {
   console.log(count);
 });
