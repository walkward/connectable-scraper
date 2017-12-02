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
    .find('.all-model-list > li > a')
    .follow('@href')
    .find('#lispecifications > a')
    .follow('@href')
    .set({
      'interface': '//div[@id="spec-area"]/ul[@class="product-spec"]/li/span[text()="Interface"]/following-sibling::div:html'
      Power Adapter
      Networking
      // 'series': 'fieldset> dl > dt:contains("Series") + dd',
      // 'model': 'fieldset> dl > dt:contains("Model") + dd',
      // 'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
      // 'bluetooth': 'fieldset > dl > dt:contains("Bluetooth") + dd',
      // 'wlan': 'fieldset > dl > dt:contains("WLAN") + dd',
      // 'lan': 'fieldset > dl > dt:contains("LAN") + dd',
      // 'usb': 'fieldset > dl > dt:contains("USB") + dd:html',
      // 'videoPorts': 'fieldset > dl > dt:contains("Video Port") + dd:html',
      // 'hdmi': 'fieldset > dl > dt:contains("HDMI") + dd',
      // 'otherPorts': 'fieldset > dl > dt:contains("Other Port") + dd:html',
      // 'audioPorts': 'fieldset > dl > dt:contains("Audio Ports") + dd:html',
      // 'service': 'fieldset > dl > dt:contains("Service") + dd',
      // 'dockingConnector': 'fieldset > dl > dt:contains("Docking Connector") + dd',
      // 'acAdapter': 'fieldset > dl > dt:contains("AC Adapter") + dd',
      // 'outletType': 'fieldset > dl > dt:contains("Electrical Outlet Plug Type") + dd',
      // 'nfcSupported': 'fieldset > dl > dt:contains("NFC Supported") + dd',
      // 'cardReader': 'fieldset > dl > dt:contains("Card Reader") + dd'
    })
    // .find('#baBreadcrumbTop')
    // .set({
    //   'category': 'dd[5] a',
    //   'supplierId': 'dd[7] em',
    //   'brand': 'dd[6] a'
    // })
    .then(function(context, data, next) {
      // Split the values which have multiple lines
      if (typeof data.interface !== 'undefined') {
        data.interface = data.interface.split(/<br>|,/g);
      }
      Power Adapter
      Networking
      Audio
      Card Reader
      Operating System

      console.log(chalk.blue(data.interface))

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
        let entityName = crypto.createHash('md5').update(product.brand + product.model + product.hostName).digest("hex");

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
    .error(function(err) {
      console.error(chalk.red('ERROR:', err));
      reject();
    })
    .debug(console.log)
    .done(function() {
      resolve();
    });
  });
}

var promiseStack = [];

// All products page
for (var i = 0; i < 1; i++) {
  let urlString = "https://www.asus.com/Laptops/AllProducts/";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
