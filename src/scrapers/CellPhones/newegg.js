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
  datastoreKind: 'CellPhones' // The kind for the new entity
};

const datastore = Datastore({projectId: 'gizmo-gild', keyFilename: '../../../config/service-account-key.json'});

function scrapeStartPage(url) {
  return new Promise((resolve, reject) => {
    osmosis.config('concurrency', 1);
    osmosis.get(url)
    .find('.items-view > .item-container > .item-info > .item-title')
    .follow('@href')
    .set({'image': '//span[@class="mainSlide"]/img/@src'})
    .find('#Specs')
    .set({
      'series': 'fieldset> dl > dt:contains("Series") + dd',
      'model': 'fieldset> dl > dt:contains("Model") + dd',
      'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
      'wifiSupport': '//dt[text()="Wi-Fi Support"]/following-sibling::dd:html',
      'wifi': '//dt[text()="WiFi"]/following-sibling::dd',
      'blutoothSupport': '//dt[text()="Bluetooth Support"]/following-sibling::dd',
      'otherConnection': '//dt[text()="Other Connection"]/following-sibling::dd',
      'audioConnectors': '//dt[text()="Audio Connectors"]/following-sibling::dd',
      'usb': '//dt[text()="USB"]/following-sibling::dd',
      'technology': '//dt[text()="Technology"]/following-sibling::dd',
      'mobileFreq': '//dt[text()="Mobile Frequencies"]/following-sibling::dd:html',
      'compatCarrier': '//dt[text()="Compatible Carrier & Service"]/following-sibling::dd',
      'dataTransfer': '//dt[text()="Data transfer"]/following-sibling::dd:html',
      'operatingSystem': '//dt[text()="Operating System"]/following-sibling::dd'
    })
    .set({
      'category': 'dd[5] a',
      'supplierId': 'dd[7] em',
      'brand': 'dd[6] a'
    })
    .then(function(context, data, next) {
      // Split the values which have multiple lines
      if (typeof data.usb !== 'undefined') {
        data.usb = data.usb.split(/<br>|,/g);
      }
      if (typeof data.dataTransfer !== 'undefined') {
        data.dataTransfer = data.dataTransfer.split(/<br>|,/g);
      }
      if (typeof data.wifiSupport !== 'undefined') {
        data.wifiSupport = data.wifiSupport.split(/<br>|,/g);
      }
      if (typeof data.mobileFreq !== 'undefined') {
        data.mobileFreq = data.mobileFreq.split(/<br>|,/g);
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

// No Contract Cell Phones
for (var i = 0; i < 23; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100167544%201100858365%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}
// Unlocked Cell Phones
for (var i = 0; i < 19; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100167543%201100858365%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
