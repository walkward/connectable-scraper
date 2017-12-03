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
const fs = require('fs');
const _ = require('lodash');
const formatUsb = require('../../utils/formatters/usb');
const formatBluetooth = require('../../utils/formatters/bluetooth');
const formatHdmi = require('../../utils/formatters/hdmi');
const formatStereoJack = require('../../utils/formatters/stereoJack');
const formatToslink = require('../../utils/formatters/toslink');
const formatSpdif = require('../../utils/formatters/spdif');
const formatDisplayPort = require('../../utils/formatters/displayport');
const formatVga = require('../../utils/formatters/vga');
const formatThunderbolt = require('../../utils/formatters/thunderbolt');
let laptopObj = require('../../schema/Laptops');
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
    .set({'image': '//span[@class="mainSlide"]/img/@src'})
    .find('#Specs')
    .set({
      'series': 'fieldset> dl > dt:contains("Series") + dd',
      'model': 'fieldset> dl > dt:contains("Model") + dd',
      'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
      'bluetooth': 'fieldset > dl > dt:contains("Bluetooth") + dd',
      'wlan': 'fieldset > dl > dt:contains("WLAN") + dd',
      'lan': 'fieldset > dl > dt:contains("LAN") + dd',
      'usb': 'fieldset > dl > dt:contains("USB") + dd:html',
      'videoPorts': 'fieldset > dl > dt:contains("Video Port") + dd:html',
      'hdmi': 'fieldset > dl > dt:contains("HDMI") + dd',
      'audioPorts': 'fieldset > dl > dt:contains("Audio Ports") + dd:html',
      'acAdapter': 'fieldset > dl > dt:contains("AC Adapter") + dd'
    })
    .find('#baBreadcrumbTop')
    .set({
      'category': 'dd[5] a',
      'brand': 'dd[6] a'
    })
    .then(function(context, product, next) {
      // Check if product.model was found, we don't want this object otherwise.
      if (typeof product.model !== 'undefined' && typeof product.model !== 'undefined') {

        let laptop = laptopObj;
        laptop.brand = product.brand;
        laptop.model = product.model;
        laptop.series = typeof product.series != "undefined" ? product.series : null;
        laptop.partNumber = typeof product.partNumber != "undefined" ? product.partNumber : null;
        laptop.image = typeof product.image != "undefined" ? product.image : null;
        laptop.category = typeof product.category !== "undefined" ? product.category.replace(/[s]\b/gi, '') : "Laptop";
        laptop.scrapedUrl = context.doc().request.href;
        laptop.wlan = typeof product.wlan != "undefined" ? _.chain(product.wlan.match(/802\.11[\s]?([acbgn\/])*/gi)).toLower().replace(' ','').value() : null;
        laptop.acAdapter = typeof product.acAdapter != "undefined" ? _.parseInt(product.acAdapter.match(/\d.*(?=\-w[att]?|w\s)/gi)) : null;
        laptop.bluetooth = typeof product.bluetooth != "undefined" ? formatBluetooth(product.bluetooth) : null;
        laptop.hdmi = typeof product.hdmi != "undefined" ? formatHdmi(product.hdmi) : null;
        laptop.usb = typeof product.usb != "undefined" ? _.chain(product.usb).unescape().split(/<br>(?=.*USB|Thunderbolt)|[\/,•;](?![\dA-z])(?=.*USB)/gi).map(function(o) { return formatUsb(o); }).uniq().compact().value() : null;
        laptop.displayPort = typeof product.videoPorts != "undefined" ? _.chain(product.videoPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatDisplayPort(o); }).compact().value() : null;
        laptop.vga = typeof product.videoPorts != "undefined" ? _.chain(product.videoPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatVga(o); }).compact().value() : null;
        laptop.thunderbolt = typeof product.videoPorts != "undefined" ? _.chain(product.videoPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatThunderbolt(o); }).compact().value() : null;
        laptop.primaryPower = null;
        laptop.dvi = null;
        laptop.toslink = typeof product.audioPorts != "undefined" ? _.chain(product.audioPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatToslink(o); }).compact().value() : null;
        laptop.spdif = typeof product.audioPorts != "undefined" ? _.chain(product.audioPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatSpdif(o); }).compact().value() : null;
        laptop.rca = null;
        laptop.stereoJack = typeof product.audioPorts != "undefined" ? _.chain(product.audioPorts).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatStereoJack(o); }).compact().value() : null;
        laptop.esata = null;
        laptop.rj45 = typeof product.lan != "undefined" ? /10\/100\/1000|Ethernet/gi.test(product.lan) : null;
        laptop.rj11 = null;
        laptop.scrapedArchive = product;

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
          data: laptop
        };

        // Saves the entity
        if (typeof argv.dry === 'undefined') {
          datastore.save(newProduct)
          .then((msg) => {
            console.log(chalk.green(JSON.stringify(msg)));
            next(context, product);
          })
          .catch((err) => {
            console.error(chalk.red('ERROR:', err));
          });
        } else {
          next(context, product);
        }

      } else {
        console.log(chalk.keyword('orange')('Warning:', 'Product not saved becuase model or brand does not exist:'), chalk.underline.keyword('orange')(product.url));
        next(context, product);
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
