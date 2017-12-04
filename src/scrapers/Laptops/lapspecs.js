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
const _ = require('lodash');
const ports = require('../../schema/ports');
const formatBrand = require('../../utils/formatters/brand');
const formatUsb = require('../../utils/formatters/usb');
const formatBluetooth = require('../../utils/formatters/bluetooth');
const formatHdmi = require('../../utils/formatters/hdmi');
const formatStereoJack = require('../../utils/formatters/stereoJack');
const formatToslink = require('../../utils/formatters/toslink');
const formatSpdif = require('../../utils/formatters/spdif');
const formatDisplayPort = require('../../utils/formatters/displayport');
const formatVga = require('../../utils/formatters/vga');
const formatThunderbolt = require('../../utils/formatters/thunderbolt');
const formatFirewire = require('../../utils/formatters/firewire');
let laptopObj = require('../../schema/Laptops');
var Promise = require('bluebird');

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Laptops' // The kind for the new entity
};

const datastore = Datastore({projectId: 'gizmo-gild', keyFilename: '../../../config/service-account-key.json'});

function scrapeStartPage(url) {
  return new Promise((resolve, reject) => {
    osmosis.get(url)
    .find('.levelnew > form > a')
    .follow('@href')
    .set({
      'acPower': '//tr/td[text()="AC Power"]/following-sibling::td',
      'serialPort': '//tr/td[text()="Serial Port"]/following-sibling::td',
      'parallelPort': '//tr/td[text()="Parallel Port"]/following-sibling::td',
      'dockingPort': '//tr/td[text()="Docking Station Port"]/following-sibling::td',
      'esataPort': '//tr/td[text()="E-SATA Port"]/following-sibling::td',
      'firewirePort': '//tr/td[text()="Firewire Ports"]/following-sibling::td',
      'usbPorts': '//tr/td[text()="USB Ports"]/following-sibling::td',
      'ethernet': '//tr/td[text()="Ethernet Port"]/following-sibling::td',
      'wireless': '//tr/td[text()="Wireless"]/following-sibling::td',
      'bluetooth': '//tr/td[text()="Bluetooth"]/following-sibling::td',
      'spdifOut': '//tr/td[text()="S/PDIF Out Port"]/following-sibling::td',
      'lineInPort': '//tr/td[text()="Line In Port"]/following-sibling::td',
      'micPort': '//tr/td[text()="Microphone Port"]/following-sibling::td',
      'headphonePort': '//tr/td[text()="Headphone Port"]/following-sibling::td',
      'hdmi': '//tr/td[text()="HDMI Out Port"]/following-sibling::td',
      'displayPort': '//tr/td[text()="DisplayPort"]/following-sibling::td',
      'tvOut': '//tr/td[text()="TV Out Port"]/following-sibling::td',
      'vgaPort': '//tr/td[text()="VGA Out Port"]/following-sibling::td',
      'name': '//tr/td[text()="Name"]/following-sibling::td',
      'ir': '//tr/td[text()="IR"]/following-sibling::td',
      'dvi': '//tr/td[text()="DVI Out Port"]/following-sibling::td'
    })
    .then(function(context, product, next) {
      // Check if product.model was found, we don't want this object otherwise.
      if (typeof product.name !== 'undefined') {

        let laptop = laptopObj;
        laptop.brand =        typeof product.name !== "undefined" ? formatBrand(product.name) : null;
        laptop.model =        typeof product.name !== "undefined" ? _.chain(product.name).replace(laptop.brand, '').trim().value() : null;
        laptop.series =       null;
        laptop.partNumber =   null;
        laptop.image =        null;
        laptop.category =     "Laptop";
        laptop.scrapedUrl =   context.doc().request.href;
        laptop.wlan =         typeof product.wireless != "undefined" ? _.chain(product.wireless.match(/802\.11[\s]?([acbgn\/])*/gi)).toLower().replace(' ','').value() : null;
        laptop.acAdapter =    typeof product.acPower != "undefined" ? product.acPower : null;
        laptop.bluetooth =    typeof product.bluetooth != "undefined" && !/No/i.test(product.bluetooth) ? 'Bluetooth ' + product.bluetooth.match(/\d\.\d/) : null;
        laptop.hdmi =         typeof product.hdmi != "undefined" ? _.chain(product.hdmi).split(/<br>|[\/,•;](?![\dA-z])/g).map(function(o) { return formatHdmi(o); }).uniq().compact().value() : null;
                              _.isEmpty(laptop.hdmi) ? laptop.hdmi = null : laptop.hdmi;
        laptop.usb =          typeof product.usbPorts != "undefined" ? _.chain(product.usbPorts).unescape().split(/<br>|[\/,•;](?![\dA-z])(?=.*USB)/gi).map(function(o) { return formatUsb(o); }).uniq().compact().value() : null;
        laptop.displayPort =  typeof product.displayPort != "undefined" && /Yes/i.test(product.displayPort) ? [ports.displayPort.types.default.name] : null;
                              typeof product.displayPort != "undefined" && /Mini/i.test(product.displayPort) ? laptop.displayPort = [ports.displayPort.types.mini.name] : null;
        laptop.vga =          typeof product.vgaPort != "undefined" && /Yes/i.test(product.vgaPort) ? ports.vga.types.default.name : null;
        laptop.thunderbolt =  null;
        laptop.primaryPower = null;
        laptop.dvi =          typeof product.dvi != "undefined" && /Yes/i.test(product.dvi) ? ports.dvi.types.default.name : null;
        laptop.toslink =      null;
        laptop.spdif =        typeof product.spdifOut != "undefined" && /Yes/i.test(product.spdifOut) ? ports.spdif.types.default.name : null;
        laptop.rca =          null;
        laptop.firewire =     typeof product.firewirePort != "undefined" ? formatFirewire(product.firewirePort) : null;
        laptop.stereoJack =   typeof product.micPort != "undefined" && /Yes/i.test(product.micPort) ? [ports.stereoJack.types.trs35m.name] : [];
                              typeof product.headphonePort != "undefined" && /Yes/i.test(product.headphonePort) ? laptop.stereoJack.push(ports.stereoJack.types.trrs35m.name) : product.headphonePort;
                              typeof product.lineInPort != "undefined" && /Yes/i.test(product.lineInPort) ? laptop.stereoJack.push(ports.stereoJack.types.stereoIn.name) : product.lineInPort;
                              _.isEmpty(laptop.stereoJack) ? laptop.stereoJack = null : laptop.stereoJack;
        laptop.esata =        typeof product.esataPort != "undefined" && /Yes/i.test(product.esataPort) ? true : null;
        laptop.parallelPort = typeof product.parallelPort != "undefined" && /Yes/i.test(product.parallelPort) ? true : null;
        laptop.serialPort =   typeof product.serialPort != "undefined" && /Yes/i.test(product.serialPort) ? true : null;
        laptop.ir =           typeof product.ir != "undefined" && /Yes/i.test(product.ir) ? true : null;
        laptop.dockingPort =  typeof product.dockingPort != "undefined" && /Yes/i.test(product.dockingPort) ? true : null;
        laptop.rj45 =         typeof product.ethernet != "undefined" && /Yes|100/i.test(product.ethernet) ? true : null;
        laptop.scrapedArchive = product;

        // console.log(chalk.keyword('cyan')(JSON.stringify(laptop, null, 2)))

        // Creating a product id which uses the model # by default, but will use the partnumber
        // instead if it is available
        let entityName = crypto.createHash('md5').update(laptop.brand + laptop.model + product.hostName).digest("hex");

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

// All products page
for (var i = 0; i < 1; i++) {
  let urlString = "http://www.lapspecs.com/compare";
  promiseStack.push(scrapeStartPage(urlString));
}

// Execute all of the promises which have been created
Promise.all([promiseStack]);
