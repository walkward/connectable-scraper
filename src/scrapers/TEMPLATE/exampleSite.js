/**
 * Scraper Template
 * -------------
 * Start Url:
 */
const osmosis = require('osmosis')
const argv = require('minimist')(process.argv.slice(2))
const _ = require('lodash')
const chalk = require('chalk')
const scraperOptions = require('../../utils/scraperOptions')
const datastoreSave = require('../../utils/datastoreSave')
const formatBrand = require('../../utils/formatters/brand')
const formatUsb = require('../../utils/formatters/usb')
const formatHdmi = require('../../utils/formatters/hdmi')
const formatToslink = require('../../utils/formatters/toslink')
const formatVga = require('../../utils/formatters/vga')
const formatDSub = require('../../utils/formatters/dsub')
const formatDvi = require('../../utils/formatters/dvi')
const formatRca = require('../../utils/formatters/rca')
const formatWlan = require('../../utils/formatters/wlan')
const formatSata = require('../../utils/formatters/sata')
const formatESata = require('../../utils/formatters/esata')
const formatSerialPort = require('../../utils/formatters/serialPort')
const formatParallelPort = require('../../utils/formatters/serialPort')
const formatDisplayPort = require('../../utils/formatters/displayPort')
const formatSpdif = require('../../utils/formatters/spdif')
const formatThunderbolt = require('../../utils/formatters/thunderbolt')
const formatStereoJack = require('../../utils/formatters/stereoJack')
const formatBluetooth = require('../../utils/formatters/bluetooth')
const formatFirewire = require('../../utils/formatters/firewire')
var Promise = require('bluebird')

const settings = {
  datastoreNamespace: 'Scraped',            // The namespace for the new entity
  // datastoreKind: '',                     // The kind for the new entity
  mode: argv.dry || false,                  // Used for running the scraper without saving data
  overwrite: argv.overwrite || false        // Entities are saved instead of inserted (thus overwriting data from older scraped pages)
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.get(url)
      .config(scraperOptions)
      .follow('.levelnew > form > a@href') // Find a link to follow
      .set({
        // 'exampleText': '//tr/td[text()="Example Text"]/following-sibling::td',
        // 'exampleHtml': '//tr/td[text()="Example HTML"]/following-sibling::td:html',
      })
      .delay(Math.ceil(Math.random() * (3000 - 1000) + 1000))
      .then((context, product, next) => {
        // Check if product.model was found, we don't want this object otherwise.
        let item = {}
        // item.exampleText = typeof product.name !== 'undefined' ? formatBrand(product.name) : null
        // item.exampleHtml = typeof product.name !== 'undefined' ? _.chain(product.usbPorts).unescape().split(/<br>|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).uniq().compact().value() : null
        // if (typeof product.exampleHtml !== 'undefined' && /Yes/i.test(product.exampleHtml)) { item.exampleHtml.push(ports.example.types.example.name) }

        item.category       = settings.datastoreKind.replace(/s$/i, '')
        item.brand          = typeof product.brand        !== 'undefined' ? formatBrand(product.brand) : null
        item.model          = typeof product.model        !== 'undefined' ? product.model : null
        item.series         = typeof product.series       !== 'undefined' ? product.series : null
        item.partNumber     = typeof product.partNumber   !== 'undefined' ? product.partNumber : null
        item.acAdapter      = typeof product.acAdapter    !== 'undefined' ? product.acAdapter : null
        item.primaryPower   = typeof product.primaryPower !== 'undefined' ? product.primaryPower : null
        item.displayPort    = typeof product.displayPort  !== 'undefined' ? formatDisplayPort(product.displayPort) : [null]
        item.firewire       = typeof product.firewire     !== 'undefined' ? formatFirewire(product.firewirePort) : null
        item.thunderbolt    = typeof product.thunderbolt  !== 'undefined' ? formatThunderbolt(product.thunderbolt) : null
        item.bluetooth      = typeof product.bluetooth    !== 'undefined' ? formatBluetooth(product.bluetooth) : null
        item.stereoJack     = typeof product.stereoJack   !== 'undefined' ? _.chain(product.stereoJack).unescape().split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatStereoJack(o) }).uniq().compact().value() : [null]
        item.wlan           = typeof product.wlan         !== 'undefined' ? formatWlan(product.wlan) : [null]
        item.hdmi           = typeof product.hdmi         !== 'undefined' ? _.chain(product.hdmi).unescape().split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatHdmi(o) }).uniq().compact().value() : [null]
        item.usb            = typeof product.usb          !== 'undefined' ? _.chain(product.usb).unescape().split(/<br>|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).uniq().compact().value() : [null]
        item.toslink        = typeof product.toslink      !== 'undefined' ? [formatToslink(product.toslink)] : [null]
        item.vga            = typeof product.vga          !== 'undefined' ? [formatVga(product.vga)] : [null]
        item.dSub           = typeof product.dSub         !== 'undefined' ? [formatDSub(product.dSub)] : [null]
        item.rca            = typeof product.rca          !== 'undefined' ? [formatRca(product.rca)] : [null]
        item.dvi            = typeof product.dvi          !== 'undefined' ? [formatDvi(product.dvi)] : [null]
        item.sata           = typeof product.sata         !== 'undefined' ? [formatSata(product.sata)] : [null]
        item.spdif          = typeof product.spdif        !== 'undefined' ? formatSpdif(product.spdif) : null
        item.esata          = typeof product.esata        !== 'undefined' ? formatESata(product.esataPort) : null
        item.parallelPort   = typeof product.parallelPort !== 'undefined' ? formatParallelPort(product.parallelPort) : null
        item.serialPort     = typeof product.serialPort   !== 'undefined' ? formatSerialPort(product.serialPort) : null
        item.ir             = typeof product.ir           !== 'undefined' ? /Yes/i.test(product.ir) : null
        item.dockingPort    = typeof product.dockingPort  !== 'undefined' ? /Yes/i.test(product.dockingPort) : null
        item.rj45           = typeof product.rj45         !== 'undefined' ? /Yes|100/i.test(product.rj45) : null
        item.image          = typeof product.image        !== 'undefined' ? product.image : null
        item.scrapedUrl     = context.doc().request.href
        item.scrapedHost    = context.doc().request.host
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

// All products page
for (var i = 0; i < 1; i++) {
  let urlString = 'http://www.lapspecs.com/compare'
  promiseStack.push(urlString)
}

// Delay the execution of each page (should be calculated as number of item per page * 2000ms)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Execute all of the promises which have been created
promiseStack.reduce(function (promise, item) {
  return promise.then(function (result) {
    return Promise.all([delay(144000), scrapeStartPage(item)])
  })
}, Promise.resolve())
