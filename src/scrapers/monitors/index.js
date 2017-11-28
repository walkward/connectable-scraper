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
  datastoreKind: 'Monitors' // The kind for the new entity
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
      'usb': 'fieldset > dl > dt:contains("USB") + dd:html',
      'outletType': 'fieldset > dl > dt:contains("Electrical Outlet Plug Type") + dd',
      'inputVideoCompatibility': 'fieldset > dl > dt:contains("Input Video Compatibility") + dd',
      'inputVideoConnectors': 'fieldset > dl > dt:contains("Input Video Connectors") + dd',
      'compatibility': '//dt[text()="Compatibility"]/following-sibling::dd',
      'displayPort': '//dt[text()="DisplayPort"]/following-sibling::dd',
      'hdcpSupport': '//dt[text()="HDCP Support"]/following-sibling::dd',
      'hdmi': '//dt[text()="HDMI"]/following-sibling::dd',
      'dSub': '//dt[text()="D-Sub"]/following-sibling::dd',
      'connectors': '//dt[text()="Connectors"]/following-sibling::dd',
      'dvi': '//dt[text()="DVI"]/following-sibling::dd',
      'powerSupply': '//dt[text()="Power Supply"]/following-sibling::dd',
      'touchscreenInterface': '//dt[text()="Touchscreen Interface"]/following-sibling::dd'
    })
    .then(function(context, data, next) {
      // Split the values which have multiple lines
      if (typeof data.usb !== 'undefined') {
        data.usb = data.usb.split(/<br>|,/g);
      }
      if (typeof data.inputVideoCompatibility !== 'undefined') {
        data.inputVideoCompatibility = data.inputVideoCompatibility.split(/<br>|,/g);
      }
      if (typeof data.connectors !== 'undefined') {
        data.connectors = data.connectors.split(/<br>|,/g);
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

// LCD / LED Monitors Pages
for (var i = 1; i < 27; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160979%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Touch Screen Monitors Pages
for (var i = 1; i < 3; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160980%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
