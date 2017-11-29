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
  datastoreKind: 'Projectors' // The kind for the new entity
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
      'series': 'fieldset> dl > dt:contains("Series") + dd',
      'model': 'fieldset> dl > dt:contains("Model") + dd',
      'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
      'usb': 'fieldset > dl > dt:contains("USB") + dd:html',
      'outletType': 'fieldset > dl > dt:contains("Electrical Outlet Plug Type") + dd',
      'inputVideoCompatibility': 'fieldset > dl > dt:contains("Input Video Compatibility") + dd:html',
      'inputVideoConnectors': 'fieldset > dl > dt:contains("Input Video Connectors") + dd:html',
      'inputAudioConnectors': 'fieldset > dl > dt:contains("Input Audio Connectors") + dd:html',
      'outputAudioConnectors': 'fieldset > dl > dt:contains("Output Audio Connectors") + dd:html',
      'compatibility': '//dt[text()="Compatibility"]/following-sibling::dd:html',
      'powerSupply': '//dt[text()="Power Supply"]/following-sibling::dd'
    })
    .find('#baBreadcrumbTop')
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
      if (typeof data.inputVideoCompatibility !== 'undefined') {
        data.inputVideoCompatibility = data.inputVideoCompatibility.split(/<br>|,/g);
      }
      if (typeof data.inputVideoConnectors !== 'undefined') {
        data.inputVideoConnectors = data.inputVideoConnectors.split(/<br>|,/g);
      }
      if (typeof data.inputAudioConnectors !== 'undefined') {
        data.inputAudioConnectors = data.inputAudioConnectors.split(/<br>|,/g);
      }
      if (typeof data.outputAudioConnectors !== 'undefined') {
        data.outputAudioConnectors = data.outputAudioConnectors.split(/<br>|,/g);
      }
      if (typeof data.compatibility !== 'undefined') {
        data.compatibility = data.compatibility.split(/<br>|,/g);
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

// Home Theatre Projector Pages
for (var i = 1; i < 8; i++) {
  let urlString = "www.newegg.com/Home-Theater-Projectors/SubCategory/ID-513/Page-" + i + "?Tid=160993&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Business Projector Pages
for (var i = 1; i < 30; i++) {
  let urlString = "www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160992%204814%201100858365&IsNodeId=1&bop=And&Page=" + i + "&PageSize=96";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
