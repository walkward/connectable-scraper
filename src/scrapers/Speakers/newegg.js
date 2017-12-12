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
  datastoreKind: 'Speakers'          // The kind for the new entity
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
      'outletType': '//dt[text()="Electrical Outlet Plug Type"]/following-sibling::dd',
      'configuration': '//dt[text()="Configuration"]/following-sibling::dd',
      'systemRequirements': '//dt[text()="System Requirements"]/following-sibling::dd:html',
      'features': '//dt[text()="Features"]/following-sibling::dd:html',
      'packageContents': '//dt[text()="Package Contents"]/following-sibling::dd:html',
      'wirelessTechnology': '//dt[text()="Wireless Technology"]/following-sibling::dd',
      'connectivity': '//dt[text()="Connectivity"]/following-sibling::dd',
      'operatingRange': '//dt[text()="Operating Range"]/following-sibling::dd',
      'speakerType': '//dt[text()="Speaker Type"]/following-sibling::dd',
      'compatibility': '//dt[text()="Compatibility"]/following-sibling::dd',
      'bluetoothVersion': '//dt[text()="Bluetooth Version"]/following-sibling::dd',
      'inputPorts': '//dt[text()="Input Ports"]/following-sibling::dd',
      'bluetoothProfile': '//dt[text()="Bluetooth Profile"]/following-sibling::dd'
    })
    .find('#baBreadcrumbTop')
    .set({
      'category': 'dd[5] a',
      'supplierId': 'dd[7] em',
      'brand': 'dd[6] a'
    })
    .find('#fullInfo')
    .set({
      'overview': '#Overview_Content .itemDesc:html'
    })
    .then(function(context, data, next) {
      // Split the values which have multiple lines
      if (typeof data.systemRequirements !== 'undefined') {
        data.systemRequirements = data.systemRequirements.split(/<br>|,/g);
      }
      if (typeof data.features !== 'undefined') {
        data.features = data.features.split(/<br>|,/g);
      }
      if (typeof data.packageContents !== 'undefined') {
        data.packageContents = data.packageContents.split(/<br>|,/g);
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
          data: product,
          excludeFromIndexes: ['overview']
        };

        // Saves the entity
        if (typeof argv.dry === 'undefined') {
          datastore.save(newProduct)
          .then((msg) => {
            console.log(chalk.green(JSON.stringify(msg)));
          })
          .catch((err) => {
            console.error(chalk.red('ERROR:', err));
            reject();
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

// Speaker Pages
for (var i = 0; i < 36; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160895%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Portable Speaker Pages
for (var i = 0; i < 40; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100023083%204814&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
