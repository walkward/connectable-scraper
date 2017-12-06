/**
 * Scraper Template
 * -------------
 * Start Url:
 */
const osmosis = require('osmosis')
const argv = require('minimist')(process.argv.slice(2))
const _ = require('lodash')
const chalk = require('chalk')
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
const formatSerialPort = require('../../utils/formatters/serialPort')
const formatDisplayPort = require('../../utils/formatters/displayPort')
const formatSpdif = require('../../utils/formatters/spdif')
const formatThunderbolt = require('../../utils/formatters/thunderbolt')
const formatStereoJack = require('../../utils/formatters/stereoJack')
const formatBluetooth = require('../../utils/formatters/bluetooth')
const formatFirewire = require('../../utils/formatters/firewire')
var Promise = require('bluebird')

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Laptops',      // The kind for the new entity
  mode: argv.dry || false        // Used for running the scraper without saving data
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.config('concurrency', 1)
    osmosis.get(url)
      .follow('.search-result-product-url@href') // Find a link to follow
      .set({
        'brand': '//span[@class="brand"]',
        'model': '//td[contains(text(),"Model:")]/following-sibling::td[@class="techspecdata"]',
        'series': '//td[contains(text(),"Product Line:")]/following-sibling::td[@class="techspecdata"]',
        'partNumber': '//span[@class="mpn"]',
        'frequency': '//td[contains(text(),"Frequency Required:")]/following-sibling::td[@class="techspecdata"]',
        'voltage': '//td[contains(text(),"Nominal Voltage:")]/following-sibling::td[@class="techspecdata"]',
        'powerProvided': '//td[contains(text(),"Power Provided:")]/following-sibling::td[@class="techspecdata"]',
        'wireless': '//td[contains(text(),"Wireless Protocol:")]/following-sibling::td[@class="techspecdata"]',
        'wired': '//td[contains(text(),"Wired Protocol:")]/following-sibling::td[@class="techspecdata"]',
        'platform': '//td[contains(text(),"Platform:")]/following-sibling::td[@class="techspecdata"]',
        'accessories': '//td[contains(text(),"Included Accessories:")]/following-sibling::td[@class="techspecdata"]',
        'dockingPort': '//td[contains(text(),"Dockable:")]/following-sibling::td[@class="techspecdata"]',
        'comparePrice': '//*[@class="msrp-wrapper"]/*[@class="msrp-price-original"]',
        'price': '//*[@id="singleCurrentItemLabel"]/*[@itemprop="price"]',
        'image': '//*[@class="main-image"]/img/@src',
        'interfaces': ['//td[contains(text(),"Interface:")]/following-sibling::td[@class="techspecdata"]']
      })
      .delay(2000)
      .then((context, product, next) => {
        // Check if product.model was found, we don't want this object otherwise.
        let item = {}

        item.category       = settings.datastoreKind.replace(/s$/i, '')
        item.brand          = typeof product.brand        !== 'undefined' ? formatBrand(product.brand) : null
        item.model          = typeof product.model        !== 'undefined' ? product.model : null
        item.series         = typeof product.series       !== 'undefined' ? product.series : null
        item.partNumber     = typeof product.partNumber   !== 'undefined' ? product.partNumber : null
        item.primaryPower   = typeof product.primaryPower !== 'undefined' ? product.primaryPower : null
        item.displayPort    = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatDisplayPort(o) }).uniq().compact().value() : [null]
        item.firewire       = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatFirewire(o) }).uniq().compact().head().value() : null
        item.thunderbolt    = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatThunderbolt(o) }).uniq().compact().head().value() : [null]
        item.bluetooth      = typeof product.wireless     !== 'undefined' ? _.chain(product.wireless).split(/<br>|[,]/g).map(function (o) { return formatBluetooth(o) }).uniq().compact().head().value() : null
        item.stereoJack     = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatStereoJack(o) }).uniq().compact().value() : [null]
        item.wlan           = typeof product.wireless     !== 'undefined' ? _.chain(product.wireless).split(/<br>|[,]/g).map(function (o) { return formatWlan(o) }).uniq().compact().value() : [null]
        item.hdmi           = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatHdmi(o) }).uniq().compact().value() : [null]
        item.usb            = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatUsb(o) }).uniq().compact().value() : [null]
        item.toslink        = typeof product.toslink      !== 'undefined' ? [formatToslink(product.toslink)] : [null]
        item.vga            = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatVga(o) }).uniq().compact().value() : [null]
        item.dSub           = typeof product.dSub         !== 'undefined' ? [formatDSub(product.dSub)] : [null]
        item.rca            = typeof product.rca          !== 'undefined' ? [formatRca(product.rca)] : [null]
        item.dvi            = typeof product.dvi          !== 'undefined' ? [formatDvi(product.dvi)] : [null]
        item.sata           = typeof product.interfaces   !== 'undefined' ? _.chain(product.interfaces).map(function (o) { return formatSata(o) }).uniq().compact().value() : [null]
        item.spdif          = typeof product.spdif        !== 'undefined' ? formatSpdif(product.spdif) : null
        item.esata          = typeof product.esata        !== 'undefined' ? /Yes/i.test(product.esataPort) : null
        item.parallelPort   = typeof product.parallelPort !== 'undefined' ? /Yes/i.test(product.parallelPort) : null
        item.serialPort     = typeof product.interfaces   !== 'undefined' ? formatSerialPort(product.serialPort) : null
        item.dockingPort    = typeof product.dockingPort  !== 'undefined' ? /Yes/i.test(product.dockingPort) : null
        item.rj45           = typeof product.wired        !== 'undefined' ? /Yes|100|Ethernet/i.test(product.rj45) : null
        item.image          = typeof product.image        !== 'undefined' ? 'https:' + product.image : null
        item.scrapedUrl     = context.doc().request.href
        item.scrapedHost    = context.doc().request.host
        item.scrapedArchive = product

        console.log(item.vga)

        product = item
        next(context, product)
      })
      .then(function (context, product, next, done) {
        // Saves the entity
        datastoreSave(product, settings)
        done()
        resolve()
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
for (var i = 1; i < 125; i++) {
  let urlString = 'https://www.cdw.com/shop/search/Computers/Notebook-Computers/result.aspx?w=C3&key=&MaxRecords=72&pCurrent=' + i
  promiseStack.push(urlString)
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

promiseStack.reduce(function (promise, item) {
  return promise.then(function (result) {
    return Promise.all([delay(144000), scrapeStartPage(item)])
  })
}, Promise.resolve())

// Execute all of the promises which have been created
// Promise.all([promiseStack])
