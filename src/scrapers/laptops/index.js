/**
 * Newegg Laptops Scraper
 * -------------
 * Start Url: https://www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090
 */

"use strict";

const osmosis = require('osmosis');
const Datastore = require('@google-cloud/datastore');
const crypto = require('crypto');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
var Promise = require('bluebird');

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Laptops' // The kind for the new entity
};

const datastore = Datastore({projectId: 'gizmo-gild', keyFilename: '../../../config/service-account-key.json'});

function scrapeStartPage(url) {
  return new Promise((resolve, reject) => {
    osmosis.config('concurrency', 1);
    osmosis.get(url)
    .find('.items-view > .item-container > .item-info > .item-title')
    .follow('@href')
    .find('.objImages .mainSlide')
    .set({'image': '//img/@src'})
    .find('#Specs')
    .set({
      'brand': 'fieldset> dl > dt:contains("Brand") + dd',
      'series': 'fieldset> dl > dt:contains("Series") + dd',
      'model': 'fieldset> dl > dt:contains("Model") + dd',
      'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
      'bluetooth': 'fieldset > dl > dt:contains("Bluetooth") + dd',
      'wlan': 'fieldset > dl > dt:contains("WLAN") + dd',
      'lan': 'fieldset > dl > dt:contains("LAN") + dd',
      'usb': 'fieldset > dl > dt:contains("USB") + dd:html',
      'videoPorts': 'fieldset > dl > dt:contains("Video Port") + dd',
      'hdmi': 'fieldset > dl > dt:contains("HDMI") + dd',
      'otherPorts': 'fieldset > dl > dt:contains("Other Port") + dd',
      'audioPorts': 'fieldset > dl > dt:contains("Audio Ports") + dd',
      'service': 'fieldset > dl > dt:contains("Service") + dd',
      'dockingConnector': 'fieldset > dl > dt:contains("Docking Connector") + dd',
      'acAdapter': 'fieldset > dl > dt:contains("AC Adapter") + dd',
      'outletType': 'fieldset > dl > dt:contains("Electrical Outlet Plug Type") + dd',
      'nfcSupported': 'fieldset > dl > dt:contains("NFC Supported") + dd',
      'cardReader': 'fieldset > dl > dt:contains("Card Reader") + dd'
    })
    .then(function(context, data, next) {
      // Split the values which have multiple lines
      if (typeof data.usb !== 'undefined') {
        data.usb = data.usb.split(/<br>|,/g);
      }
      if (typeof data.audioPorts !== 'undefined') {
        data.audioPorts = data.audioPorts.split(/<br>|,/g);
      }
      if (typeof data.videoPorts !== 'undefined') {
        data.videoPorts = data.videoPorts.split(/<br>|,/g);
      }
      if (typeof data.otherPorts !== 'undefined') {
        data.otherPorts = data.otherPorts.split(/<br>|,/g);
      }

      // Adding the current url to our data object
      data.url = context.doc().request.href;
      // Adding hostname to data
      data.hostName = context.doc().request.hostname;
      // Adding updatedDate to record when crawl took place
      data.dateUpdated = new Date();
      next(context, data);
    })
    .data(function(product) {
      // Check if product.model was found, we don't want this object otherwise.
      if (typeof product.model !== 'undefined' && typeof product.model !== 'undefined') {
        // Creating a product id which uses the model # by default, but will use the partnumber
        // instead if it is available
        let entityName = crypto.createHash('md5').update(product.brand + product.model).digest("hex");

        const productKey = datastore.key({
          namespace: settings.datastoreNamespace,
          path: [settings.datastoreKind, entityName]
        });

        // Assign the data from the product object to our new datastore entity.
        const newProduct = {
          key: productKey,
          data: product
        };

        // Saves the entity
        if (typeof argv.dry === 'undefined') {
          datastore.save(newProduct)
          .then((msg) => {
            console.log(chalk.green(JSON.stringify(msg)));
          })
          .catch((err) => {
            console.error(chalk.red('ERROR:', err));
          });
        }

      } else {
        console.log(chalk.keyword('orange')('Warning:', 'Product not saved becuase model or brand does not exist:'), chalk.underline.keyword('orange')(product.url));
      }
    })
    .error(function() {
      reject();
    })
    .debug(console.log)
    .done(function() {
      resolve();
    });
  });
}

var promiseStack = [];

// Laptop category Category Pages
for (var i = 1; i < 100; i++) {
  let urlString = "www.newegg.com/Laptops-Notebooks/SubCategory/ID-32/Page-" + i + "?Tid=6740&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Gaming Laptop Category Pages
for (var i = 1; i < 17; i++) {
  let urlString = "www.newegg.com/Gaming-Laptops/SubCategory/ID-3365/Page-" + i + "?Tid=167748&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// 2-in-1 Laptop Laptop Category Pages
for (var i = 1; i < 12; i++) {
  let urlString = "www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090/Page-" + i + "?Tid=20039&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Chromebook Laptop Category Pages
for (var i = 1; i < 4; i++) {
  let urlString = "www.newegg.com/Chromebooks/SubCategory/ID-3220/Page-" + i + "?Tid=167750&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Mobile Workstation Laptop Category Pages
for (var i = 1; i < 9; i++) {
  let urlString = "www.newegg.com/Mobile-Workstations/SubCategory/ID-3413/Page-" + i + "?Tid=167751&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);