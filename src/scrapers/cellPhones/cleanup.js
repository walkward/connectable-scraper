/**
 * Creates an array of keywords to be used for search
 * -------------
 * @param {String!} namespace The entity namespace to be updated
 * @param {String!} kind      The entity kind to be updated
 * @param {String!} key       The entity key to be deleted
 *
 * Sample Command: node src/utils/cleanData.js --namespace=Product --kind=Laptop --key=audio
 */

"use strict";

var Promise = require('bluebird');
const Datastore = require('@google-cloud/datastore');
const argv = require('minimist')(process.argv.slice(2));
const schema = require('../../../config/schema.js');
const _ = require('lodash');

const datastore = Datastore({
  projectId: 'gizmo-gild',
  keyFilename: '../../../config/service-account-key.json'
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

        try {
          // Brand re-formatting
          let schemaItem = "";
          switch (item.brand) {
            case (item.brand.match(/ASUS.*$/i) || {}).input:
              schemaItem = schema.brand.asus;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/ACER.*$/i) || {}).input:
              schemaItem = schema.brand.acer;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Apple.*$|Macbook.*$/i) || {}).input:
              schemaItem = schema.brand.apple;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/(Hewlett.*$)|(HP.*$)/) || {}).input:
              schemaItem = schema.brand.hp;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Lenovo.*$/i) || {}).input:
              schemaItem = schema.brand.lenovo;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Microsoft.*$/i) || {}).input:
              schemaItem = schema.brand.microsoft;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Eluktronics.*$/i) || {}).input:
              schemaItem = schema.brand.eluktronics;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Dell.*$/i) || {}).input:
              schemaItem = schema.brand.dell;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            case (item.brand.match(/Samsung.*$/i) || {}).input:
              schemaItem = schema.brand.samsung;
              if (item.brand !== schemaItem){
                console.log("UPDATE:", item.brand, "=> ", schemaItem)
                item.brand = schemaItem;
              }
              break;
            default:
              // console.log("NO RULE:", item.brand)
              break;
          }

          // Reformatting the HDMI objects
          switch (item.HDMI) {
            case (item.HDMI.match(/Mini.*$/i) || {}).input:
              schemaItem = schema.hdmi.miniHdmi;
              if (item.HDMI !== schemaItem){
                console.log("UPDATE:", item.HDMI, "=> ", schemaItem)
                item.HDMI = schemaItem;
              }
              break;
            case (item.HDMI.match(/30Hz.*$/i) || {}).input:
              schemaItem = schema.hdmi.default;
              if (item.HDMI !== schemaItem){
                console.log("UPDATE:", item.HDMI, "=> ", schemaItem)
                item.HDMI = schemaItem;
              }
              break;
            case (item.HDMI.match(/1.*$|2.*$/) || {}).input:
              schemaItem = schema.hdmi.default;
              if (item.HDMI !== schemaItem){
                console.log("UPDATE:", item.HDMI, "=> ", schemaItem)
                item.HDMI = schemaItem;
              }
              break;
            case (item.HDMI.match(/Yes.*$/i) || {}).input:
              schemaItem = schema.hdmi.default;
              console.log("UPDATE:", item.HDMI, "=> ", schemaItem)
              item.HDMI = schemaItem;
              break;
            case (item.HDMI.match(/No.*$/i) || {}).input:
              console.log("UPDATE:", item.HDMI, "=> None")
              delete item.HDMI;
              break;
            case (item.HDMI.match(/HDMI.*$/i) || {}).input:
              schemaItem = schema.hdmi.default;
              if (item.HDMI !== schemaItem){
                console.log("UPDATE:", item.HDMI, "=> ", schemaItem)
                item.HDMI = schemaItem;
              }
              break;
            default:
              console.log("NO RULE:", item.HDMI)
              break;
          }

          // Standardizing the bluetooth items
          switch (item.bluetooth) {
            case (item.bluetooth.match(/Yes.*$/i) || {}).input:
              schemaItem = schema.bluetooth.default;
              console.log("UPDATE:", item.bluetooth, "=> ", schemaItem)
              item.bluetooth = schemaItem;
              break;
            case (item.bluetooth.match(/No.*$/) || {}).input:
              console.log("UPDATE:", item.bluetooth, "=> ", "None")
              delete item.bluetooth;
              break;
            case (item.bluetooth.match(/4\.0.*$/i) || {}).input:
              schemaItem = schema.bluetooth.bluetooth40;
              if (item.bluetooth !== schemaItem){
                console.log("UPDATE:", item.bluetooth, "=> ", schemaItem)
                item.bluetooth = schemaItem;
              }
              break;
            case (item.bluetooth.match(/4\.1.*$/i) || {}).input:
              schemaItem = schema.bluetooth.bluetooth41;
              if (item.bluetooth !== schemaItem){
                console.log("UPDATE:", item.bluetooth, "=> ", schemaItem)
                item.bluetooth = schemaItem;
              }
              break;
            case (item.bluetooth.match(/4\.2.*$/i) || {}).input:
              schemaItem = schema.bluetooth.bluetooth42;
              if (item.bluetooth !== schemaItem){
                console.log("UPDATE:", item.bluetooth, "=> ", schemaItem)
                item.bluetooth = schemaItem;
              }
              break;
            default:
              // console.log("NO RULE:", item.bluetooth)
              break;
          }

          // Standardizing the USB types
          _.forEach(item.usb, function(value, key) {
            switch (value) {
              case (value.match(/^(?=.*[123456].*)(?!.*[a-g].*).*$/i) || {}).input:
                schemaItem = schema.usb.default;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.1.*)(?!.*Micro.*)(?!.*Type.*).*$/i) || {}).input:
                schemaItem = schema.usb.usb31;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.0.*)(?!.*Micro.*)(?!.*Type.*).*$/i) || {}).input:
                schemaItem = schema.usb.usb30;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.1.*)(?!.*Micro.*)(?=.*Type-A.*).*$/i) || {}).input:
                schemaItem = schema.usb.usb31;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.0.*)(?!.*Micro.*)(?=.*Type-A.*).*$/i) || {}).input:
                schemaItem = schema.usb.usb30;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 2\.0.*)(?!.*Micro.*).*$|^(?=.*USB 2\.0.*)(?!.*Micro.*).*$/i) || {}).input:
                schemaItem = schema.usb.usb20;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.1.*)(?=.*Type-C.*).*$|^(?=.*USB 3\.1.*)(?=.*Type C.*).*$/i) || {}).input:
                schemaItem = schema.usb.usbTypeC31;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.0.*)(?=.*Type-C.*).*$|^(?=.*USB 3\.0.*)(?=.*Type C.*).*$/i) || {}).input:
                schemaItem = schema.usb.usbTypeC30;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 2\.0.*)(?=.*Micro.*)(?!.*Type.*).*$/i) || {}).input:
                schemaItem = schema.usb.usbMicro20;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.0.*)(?=.*Micro.*)(?!.*Type.*).*$/i) || {}).input:
                schemaItem = schema.usb.usbMicro20;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              case (value.match(/^(?=.*USB 3\.1.*)(?=.*Micro.*)(?!.*Type.*).*$/i) || {}).input:
                schemaItem = schema.usb.usbMicro20;
                if (value !== schemaItem){
                  // console.log("UPDATE:", value, "=> ", schemaItem)
                  item.usb[key] = schemaItem;
                }
                break;
              default:
                console.log("NO RULE:", item.usb[key])
                break;
            }

            // if (value.match(/^(?=.*\,.*).*$/)){
            //   let splitItems = item.usb[key].split(', ');
            //   item.usb = _.pull(item.usb, item.usb[key]);
            //   item.usb = _.merge(item.usb, splitItems);
            // }

            // item.usb[key] = value.split(',');
            // console.log(item.usb[key])
          });

          // console.log(item.usb)

        }
        catch (e) {}
        finally {
          return {
            key: item[datastore.KEY],
            data: item
          };
        }

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
