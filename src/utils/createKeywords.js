/**
 * Creates an array of keywords to be used for search
 * -------------
 * @param {String!} namespace The entity namespace to be updated
 * @param {String!} kind      The entity kind to be updated
 * @param {String!} key       The entity key to be deleted
 *
 * Sample Command: npm run createKeywords -- --namespace=Product --kind=Laptop
 */

 "use strict";

 var Promise = require('bluebird');
 const _ = require('lodash');
 const Datastore = require('@google-cloud/datastore');
 const argv = require('minimist')(process.argv.slice(2));

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
       let keys = items.map(function(item) {
         item.keywords = [];

         if(typeof item.partNumber !== 'undefined'){
           item.keywords.push(item.partNumber.toLowerCase() || '')
         }
         if(typeof item.model !== 'undefined'){
           item.keywords.push(item.model.toLowerCase().split(' ') || '')
         }
         if(typeof item.brand !== 'undefined'){
           item.keywords.push(item.brand.toLowerCase() || '')
         }
         if(typeof item.series !== 'undefined'){
           item.keywords.push(item.series.toLowerCase().split(' ') || '')
         }

         item.keywords = _.flattenDeep(item.keywords);
         item.keywords = _.compact(item.keywords);
         item.keywords = _.remove(item.keywords, function(n){
           return n.length > 2;
         });

         return {
           key: item[datastore.KEY],
           data: item
         };
       });

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
