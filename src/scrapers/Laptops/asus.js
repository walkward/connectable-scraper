/**
 * Newegg Laptops Scraper
 * -------------
 * Start Url: https://www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090
 */

'use strict'

const osmosis = require('osmosis')
const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const _ = require('lodash')
const datastoreSave = require('../../utils/datastoreSave')
const formatUsb = require('../../utils/formatters/usb')
const formatBluetooth = require('../../utils/formatters/bluetooth')
const formatHdmi = require('../../utils/formatters/hdmi')
const formatStereoJack = require('../../utils/formatters/stereoJack')
const formatToslink = require('../../utils/formatters/toslink')
const formatSpdif = require('../../utils/formatters/spdif')
const formatDisplayPort = require('../../utils/formatters/displayport')
const formatVga = require('../../utils/formatters/vga')
const formatThunderbolt = require('../../utils/formatters/thunderbolt')
var Promise = require('bluebird')

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Laptops',      // The kind for the new entity
  mode: argv.dry = false         // Used for running the scraper without saving data
}

// Custom function for identifying Series in ASUS laptops
function asusSeries (title) {
  let seriesName = null
  switch (true) {
    case /ZenBook\sPro/.test(title):
      seriesName = 'ZenBook Pro'
      break
    case /ZenBook\s3/.test(title):
      seriesName = 'ZenBook Deluxe'
      break
    case /ZenBook/.test(title):
      seriesName = 'ZenBook Classic'
      break
    case /VivoBook\sPro/.test(title):
      seriesName = 'VivoBook Pro'
      break
    case /VivoBook\sMax/.test(title):
      seriesName = 'VivoBook Pro'
      break
    case /VivoBook\sS/.test(title):
      seriesName = 'VivoBook S'
      break
    case /VivoBook/.test(title):
      seriesName = 'VivoBook'
      break
    case /Chromebook/.test(title):
      seriesName = 'Chromebook'
      break
    case /ASUSPRO/.test(title):
      seriesName = 'ASUSPRO'
      break
    case /FX/.test(title):
      seriesName = 'FX'
      break
    case /ROG/.test(title):
      seriesName = 'Gaming'
      break
  }
  return seriesName
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.get(url)
      .find('.all-model-list > li > a')
      .follow('@href')
      .find('#lispecifications > a')
      .follow('@href')
      .set({
        'interface': '//div[@id="spec-area"]/ul[@class="product-spec"]/li/span[text()="Interface"]/following-sibling::div:html',
        'wlan': '//div[@id="spec-area"]/ul[@class="product-spec"]/li/span[text()="Networking"]/following-sibling::div:html',
        'powerAdapter': '//div[@id="spec-area"]/ul[@class="product-spec"]/li/span[text()="Power Adapter"]/following-sibling::div:html',
        'title': '//h1[@class="page-title"]/span'
      })
      .then(function (context, product, next) {
      // Check if product.model was found, we don't want this object otherwise.
        let laptop = {}
        laptop.brand =            'ASUS'
        laptop.model =            typeof product.title !== 'undefined' ? _.chain(product.title).replace(/\(([^)]+)\)/, '').replace(/ASUS|Laptop/g, '').trim().value() : null
        laptop.series =           typeof product.title !== 'undefined' ? asusSeries(product.title) : null
        laptop.category =         typeof product.category !== 'undefined' ? product.category.replace(/[s]\b/gi, '') : 'Laptop'
        laptop.wlan =             typeof product.wlan !== 'undefined' ? _.chain(product.wlan.match(/802\.11[\s]?([acbgn/])*/gi)).toLower().replace(' ', '').value() : null
        laptop.acAdapter =        typeof product.powerAdapter !== 'undefined' ? _.parseInt(product.powerAdapter.match(/[\d]{2,3}(?=\sW)/gi)) : null
        laptop.bluetooth =        typeof product.wlan !== 'undefined' ? _.chain(product.wlan).replace('<strong>Bluetooth</strong>', '').split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatBluetooth(o) }).uniq().compact().value() : null
        laptop.hdmi =             typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatHdmi(o) }).uniq().compact().value() : null
        laptop.usb =              typeof product.interface !== 'undefined' ? _.chain(product.interface).unescape().split(/<br>|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).uniq().compact().value() : null
        laptop.displayPort =      typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatDisplayPort(o) }).uniq().compact().value() : null
        laptop.vga =              typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatVga(o) }).uniq().compact().value() : null
        laptop.thunderbolt =      typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatThunderbolt(o) }).uniq().compact().value() : null
        laptop.primaryPower =     typeof product.powerAdapter !== 'undefined' ? _.head(product.powerAdapter.match(/ø[\d.\s(mm)]+/gi)) : null
        laptop.toslink =          typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatToslink(o) }).uniq().compact().value() : null
        laptop.spdif =            typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatSpdif(o) }).uniq().compact().value() : null
        laptop.stereoJack =       typeof product.interface !== 'undefined' ? _.chain(product.interface).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatStereoJack(o) }).uniq().compact().value() : null
        laptop.rj45 =             typeof product.interface !== 'undefined' && /10\/100|Ethernet|RJ45/i.test(product.interface) ? true : null
        laptop.scrapedUrl = context.doc().request.href
        laptop.scrapedHost = context.doc().request.host
        laptop.scrapedArchive = product

        // Saves the entity
        datastoreSave(laptop, settings)
          .then((msg) => {
            next(context, product)
          })
      })
      .error(function (err) {
        console.error(chalk.red('ERROR:', err))
        reject(err)
      })
      .debug(console.log)
      .done(function () {
        resolve()
      })
  })
}

var promiseStack = []

// All products page
for (var i = 0; i < 1; i++) {
  let urlString = 'https://www.asus.com/Laptops/AllProducts/'
  promiseStack.push(scrapeStartPage(urlString))
}

// Execute all of the promises which have been created
Promise.all([promiseStack])
