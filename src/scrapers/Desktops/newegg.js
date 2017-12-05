/**
 * Newegg Laptops Scraper
 * -------------
 * Start Url: https://www.newegg.com/2-in-1-Laptops/SubCategory/ID-3090
 */

'use strict'

const osmosis = require('osmosis')
const argv = require('minimist')(process.argv.slice(2))
const _ = require('lodash')
const ports = require('../../schema/ports')
const datastoreSave = require('../../utils/datastoreSave')
const formatUsb = require('../../utils/formatters/usb')
const formatHdmi = require('../../utils/formatters/hdmi')
const formatVga = require('../../utils/formatters/vga')
const formatDvi = require('../../utils/formatters/dvi')
const formatDisplayPort = require('../../utils/formatters/displayPort')
const formatThunderbolt = require('../../utils/formatters/thunderbolt')
const formatStereoJack = require('../../utils/formatters/stereoJack')
const formatBluetooth = require('../../utils/formatters/bluetooth')
const chalk = require('chalk')
var Promise = require('bluebird')

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Desktops',             // The kind for the new entity
  mode: argv.dry || false         // Used for running the scraper without saving data
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.get(url)
      .find('.items-view > .item-container > .item-info > .item-title')
      .follow('@href')
      .set({'image': '//span[@class="mainSlide"]/img/@src'})
      .find('#Specs')
      .set({
        'series': 'fieldset> dl > dt:contains("Series") + dd',
        'model': 'fieldset > dl > dt:contains("Model") + dd',
        'partNumber': 'fieldset> dl > dt:contains("Part Number") + dd',
        'bluetooth': 'fieldset > dl > dt:contains("Bluetooth") + dd',
        'wlan': 'fieldset > dl > dt:contains("WLAN") + dd',
        'ethernet': 'fieldset > dl > dt:contains("Ethernet") + dd',
        'lanSpeed': 'fieldset > dl > dt:contains("LAN Speed") + dd',
        'rj45': 'fieldset > dl > dt:contains("RJ45") + dd',
        'frontUsb': 'fieldset > dl > dt:contains("Front USB") + dd:html',
        'rearUsb': 'fieldset > dl > dt:contains("Rear USB") + dd:html',
        'videoPorts': 'fieldset > dl > dt:contains("Video Ports") + dd:html',
        'frontAudio': 'fieldset > dl > dt:contains("Front Audio Ports") + dd:html',
        'rearAudio': 'fieldset > dl > dt:contains("Rear Audio Ports") + dd:html',
        'acAdapter': 'fieldset > dl > dt:contains("AC Adapter") + dd',
        'powerSupply': 'fieldset > dl > dt:contains("Power Supply") + dd'
      })
      .find('#baBreadcrumbTop')
      .set({
        'category': 'dd[5] a',
        'brand': 'dd[6] a'
      })
      .then((context, product, next) => {
        // Check if product.model was found, we don't want this object otherwise.
        let item = {}

        item.category       = typeof product.category     !== 'undefined' ? product.category.replace(/s$/i, '') : null
        item.brand          = typeof product.brand        !== 'undefined' ? product.brand : null
        item.model          = typeof product.model        !== 'undefined' ? product.model : null
        item.series         = typeof product.series       !== 'undefined' ? product.series : null
        item.partNumber     = typeof product.partNumber   !== 'undefined' ? product.partNumber : null
        item.primaryPower   = typeof product.powerSupply  !== 'undefined' ? product.powerSupply : null
        item.displayPort    = typeof product.videoPorts   !== 'undefined' ? _.chain(product.videoPorts).split(/[0-9][^.][xX\s-]{1,3}|<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatDisplayPort(o) }).uniq().compact().value() : null
        item.thunderbolt    = typeof product.videoPorts   !== 'undefined' ? _.chain(product.videoPorts).split(/[0-9][^.][xX\s-]{1,3}|<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatThunderbolt(o) }).uniq().compact().head().value() : null
        item.bluetooth      = typeof product.bluetooth    !== 'undefined' ? formatBluetooth(product.bluetooth) : null
        item.stereoJack     = typeof product.frontAudio   !== 'undefined' ? _.chain(product.frontAudio).split(/<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatStereoJack(o) }).uniq().compact().value() : []
        if (typeof product.rearAudio !== 'undefined') { let rearAudio = _.chain(product.rearAudio).unescape().split(/<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatStereoJack(o) }).uniq().compact().value(); item.stereoJack = _.union(item.stereoJack, rearAudio) }
        // Check if Audio port field is empty and scraped fields have positive sentiment, values including 'Port', or single integer values.
        if (typeof product.frontAudio !== 'undefined' && item.stereoJack.length < 1 && /\d[\s]?port|Yes|\d/i.test(product.frontAudio)) { item.stereoJack.push(ports.stereoJack.types.trs35m.name) }
        if (typeof product.rearAudio !== 'undefined' && item.stereoJack.length < 1 && /\d[\s]?port|Yes|\d/i.test(product.rearAudio)) { item.stereoJack.push(ports.stereoJack.types.trs35m.name) }

        item.wlan           = typeof product.wlan         !== 'undefined' ? _.chain(product.wlan.match(/802\.11[\s]?([acbgn/])*/gi)).toLower().replace(' ', '').split(',').compact().value() : null
        item.hdmi           = typeof product.videoPorts   !== 'undefined' ? _.chain(product.videoPorts).split(/[0-9][^.][xX\s-]{1,3}|<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatHdmi(o) }).uniq().compact().value() : null
        item.usb            = typeof product.frontUsb     !== 'undefined' ? _.chain(product.frontUsb).unescape().split(/<br>(?=.*USB|Thunderbolt)|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).uniq().compact().value() : []
        if (typeof product.rearUsb !== 'undefined') { let rearUsb = _.chain(product.rearUsb).unescape().split(/<br>(?=.*USB|Thunderbolt)|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).uniq().compact().value(); item.usb = _.union(item.usb, rearUsb) }
        // Check if USB field is empty and scraped fields have positive sentiment or single integer values.
        if (typeof product.frontUsb !== 'undefined' && item.usb.length < 1 && /Yes|\d/i.test(product.frontUsb)) { item.usb.push(ports.usb.types.typeA.name) }
        if (typeof product.rearUsb !== 'undefined' && item.usb.length < 1 && /Yes|\d/i.test(product.rearUsb)) { item.usb.push(ports.usb.types.typeA.name) }

        item.vga            = typeof product.videoPorts   !== 'undefined' ? _.chain(product.videoPorts).split(/[0-9][^.][xX\s-]{1,3}|<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatVga(o) }).uniq().compact().value() : null
        item.dvi            = typeof product.videoPorts   !== 'undefined' ? _.chain(product.videoPorts).split(/[0-9][^.][xX\s-]{1,3}|<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatDvi(o) }).uniq().compact().value() : null
        item.spdif          = typeof product.spdif        !== 'undefined' ? [ports.spdif.types.default.name] : null
        item.rj45           = typeof product.rj45         !== 'undefined' && !/No/i.test(product.rj45) ? true : null
        if (typeof product.ethernet !== 'undefined' && typeof item.rj45 !== 'boolean') { item.rj45 = /Yes|Ethernet/i.test() }
        if (typeof product.lanSpeed !== 'undefined' && typeof item.rj45 !== 'boolean') { item.rj45 = /Yes|100/i.test(product.ethernet) }

        item.image          = typeof product.image        !== 'undefined' ? 'https:' + product.image : null
        item.scrapedUrl     = context.doc().request.href
        item.scrapedHost    = context.doc().request.host
        item.scrapedArchive = product

        // Saves the entity
        datastoreSave(item, settings)
          .then((msg) => {
            next(context, product)
          })
      })
      .error((err) => {
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

// Desktop Computer Pages
for (var i = 1; i < 100; i++) {
  let urlString = 'www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100019096%201100858365%204814&IsNodeId=1&bop=And&Page=' + i + '&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Execute all of the promises which have been created
Promise.all([promiseStack])
