/**
 * Newegg Laptops Scraper
 * -------------
 * Start Url: https://www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090
 */

'use strict'

const osmosis = require('osmosis')
const datastoreSave = require('../../utils/datastoreSave')
const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const _ = require('lodash')
const ports = require('../../schema/Ports')
const formatUsb = require('../../utils/formatters/usb')
const formatBluetooth = require('../../utils/formatters/bluetooth')
const formatHdmi = require('../../utils/formatters/hdmi')
const formatWlan = require('../../utils/formatters/wlan')
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
  mode: argv.dry || false        // Used for running the scraper without saving data
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.config('concurrency', 5)
    osmosis.get(url)
      .follow('.items-view > .item-container > .item-info > .item-title@href')
      .set({
        'image': '//span[@class="mainSlide"]/img/@src',
        'series': '#Specs fieldset> dl > dt:contains("Series") + dd',
        'model': '#Specs fieldset> dl > dt:contains("Model") + dd',
        'partNumber': '#Specs fieldset> dl > dt:contains("Part Number") + dd',
        'bluetooth': '#Specs fieldset > dl > dt:contains("Bluetooth") + dd',
        'wlan': '#Specs fieldset > dl > dt:contains("WLAN") + dd',
        'lan': '#Specs fieldset > dl > dt:contains("LAN") + dd',
        'usb': '#Specs fieldset > dl > dt:contains("USB") + dd:html',
        'videoPorts': '#Specs fieldset > dl > dt:contains("Video Port") + dd:html',
        'hdmi': '#Specs fieldset > dl > dt:contains("HDMI") + dd',
        'audioPorts': '#Specs fieldset > dl > dt:contains("Audio Ports") + dd:html',
        'acAdapter': '#Specs fieldset > dl > dt:contains("AC Adapter") + dd',
        'category': '#baBreadcrumbTop dd[5] a',
        'brand': '#baBreadcrumbTop dd[6] a'
      })
      .then(function (context, product, next) {
      // Check if product.model was found, we don't want this object otherwise.
        let item = {}
        item.brand =        product.brand
        item.model =        product.model
        item.series =       typeof product.series !== 'undefined' ? product.series : null
        item.partNumber =   typeof product.partNumber !== 'undefined' ? product.partNumber : null
        item.image =        typeof product.image !== 'undefined' ? 'https:' + product.image : null
        item.category =     typeof product.category !== 'undefined' ? product.category.replace(/[s]\b/gi, '') : 'Laptop'
        item.wlan =         typeof product.wlan !== 'undefined' ? formatWlan(product.wlan) : [null]
        item.acAdapter =    typeof product.acAdapter !== 'undefined' ? product.acAdapter : null
        item.bluetooth =    typeof product.bluetooth !== 'undefined' ? formatBluetooth(product.bluetooth) : null
        item.hdmi =         typeof product.hdmi !== 'undefined' ? [formatHdmi(product.hdmi)] : [null]
        item.usb =          typeof product.usb !== 'undefined' ? _.chain(product.usb).unescape().split(/<br>(?=.*USB|Thunderbolt)|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).castArray().uniq().compact().value() : [null]
        // Check if USB field is empty and scraped fields have positive sentiment or single integer values.
        if (typeof product.usb !== 'undefined' && item.usb.length < 1 && /Yes|\d/i.test(product.usb)) { item.usb.push(ports.usb.types.typeA.name) }

        item.displayPort =  typeof product.videoPorts !== 'undefined' ? _.chain(product.videoPorts).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatDisplayPort(o) }).castArray().uniq().compact().value() : [null]
        item.vga =          typeof product.videoPorts !== 'undefined' ? _.chain(product.videoPorts).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatVga(o) }).castArray().uniq().compact().value() : [null]
        item.thunderbolt =  typeof product.videoPorts !== 'undefined' ? formatThunderbolt(product.videoPorts) : null
        item.toslink =      typeof product.audioPorts !== 'undefined' ? _.chain(product.audioPorts).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatToslink(o) }).castArray().uniq().compact().value() : [null]
        item.spdif =        typeof product.audioPorts !== 'undefined' ? _.chain(product.audioPorts).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatSpdif(o) }).castArray().compact().head().value() : null
        item.stereoJack =   typeof product.audioPorts !== 'undefined' ? _.chain(product.audioPorts).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatStereoJack(o) }).castArray().uniq().compact().value() : [null]
        item.rj45 =         typeof product.lan !== 'undefined' && /10\/100|Ethernet/gi.test(product.lan) ? true : null
        item.scrapedUrl = context.doc().request.href
        item.scrapedHost = context.doc().request.host
        item.scrapedArchive = product

        product = item
        next(context, product)
      })
      .then(function (context, product, next, done) {
        // Saves the entity
        datastoreSave(product, settings)
        done()
      })
      .error(function (err) {
        console.error(chalk.red('ERROR:', err))
        reject(err)
      })
      .debug(console.log)
  })
}

var promiseStack = []

// Laptop category Category Pages
for (var i = 0; i < 100; i++) {
  let urlString = 'www.newegg.com/Laptops-Notebooks/SubCategory/ID-32/Page-' + i + '?Tid=6740&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Gaming Laptop Category Pages
for (i = 0; i < 17; i++) {
  let urlString = 'www.newegg.com/Gaming-Laptops/SubCategory/ID-3365/Page-' + i + '?Tid=167748&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// 2-in-1 Laptop Laptop Category Pages
for (i = 0; i < 12; i++) {
  let urlString = 'www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090/Page-' + i + '?Tid=20039&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Chromebook Laptop Category Pages
for (i = 0; i < 4; i++) {
  let urlString = 'www.newegg.com/Chromebooks/SubCategory/ID-3220/Page-' + i + '?Tid=167750&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Mobile Workstation Laptop Category Pages
for (i = 0; i < 9; i++) {
  let urlString = 'www.newegg.com/Mobile-Workstations/SubCategory/ID-3413/Page-' + i + '?Tid=167751&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Execute all of the promises which have been created
Promise.all([promiseStack])
