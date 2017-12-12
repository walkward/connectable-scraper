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
const formatUsb = require('../../utils/formatters/usb')
const formatHdmi = require('../../utils/formatters/hdmi')
const formatVga = require('../../utils/formatters/vga')
const formatDSub = require('../../utils/formatters/dSub')
const formatRca = require('../../utils/formatters/dSub')
const formatDvi = require('../../utils/formatters/dSub')
const formatDisplayPort = require('../../utils/formatters/displayPort')
const formatThunderbolt = require('../../utils/formatters/thunderbolt')
const formatStereoJack = require('../../utils/formatters/stereoJack')
var Promise = require('bluebird')

const settings = {
  datastoreNamespace: 'Scraped', // The namespace for the new entity
  datastoreKind: 'Monitors',     // The kind for the new entity
  mode: argv.dry || false        // Used for running the scraper without saving data
}

function scrapeStartPage (url) {
  return new Promise((resolve, reject) => {
    osmosis.get(url)
      .follow('.items-view > .item-container > .item-info > .item-title@href')
      .set({
        'series': '#Specs fieldset> dl > dt:contains("Series") + dd',
        'model': '#Specs fieldset> dl > dt:contains("Model") + dd',
        'partNumber': '#Specs fieldset> dl > dt:contains("Part Number") + dd',
        'usb': '#Specs fieldset > dl > dt:contains("USB") + dd:html',
        'inputVideoCompatibility': '#Specs fieldset > dl > dt:contains("Input Video Compatibility") + dd:html',
        'inputVideoConnectors': '#Specs fieldset > dl > dt:contains("Input Video Connectors") + dd',
        'compatibility': '//dt[text()="Compatibility"]/following-sibling::dd',
        'displayPort': '//dt[text()="DisplayPort"]/following-sibling::dd',
        'hdcpSupport': '//dt[text()="HDCP Support"]/following-sibling::dd',
        'hdmi': '//dt[text()="HDMI"]/following-sibling::dd',
        'dSub': '//dt[text()="D-Sub"]/following-sibling::dd',
        'connectors': '//dt[text()="Connectors"]/following-sibling::dd:html',
        'dvi': '//dt[text()="DVI"]/following-sibling::dd',
        'powerSupply': '//dt[text()="Power Supply"]/following-sibling::dd',
        'category': '#baBreadcrumbTop dd[5] a',
        'brand': '#baBreadcrumbTop dd[6] a'
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
        item.displayPort    = typeof product.displayPort  !== 'undefined' ? [formatDisplayPort(product.displayPort)] : [null]
        if (typeof product.connectors !== 'undefined' && item.displayPort.length < 1) { let connectors = _.chain(product.connectors).unescape().split(/<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatDisplayPort(o) }).uniq().compact().value(); item.displayPort = _.union(item.displayPort, connectors) }

        item.thunderbolt    = typeof product.connectors   !== 'undefined' ? _.chain(product.connectors).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatThunderbolt(o) }).castArray().uniq().compact().head().value() : null
        item.stereoJack     = typeof product.connectors   !== 'undefined' ? _.chain(product.connectors).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatStereoJack(o) }).castArray().uniq().compact().value() : [null]
        item.hdmi           = typeof product.hdmi         !== 'undefined' ? _.chain(product.hdmi).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatHdmi(o) }).castArray().uniq().compact().value() : [null]
        if (typeof product.connectors !== 'undefined' && item.hdmi.length < 1) { let connectors = _.chain(product.connectors).unescape().split(/<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatHdmi(o) }).uniq().compact().value(); item.hdmi = _.union(item.hdmi, connectors) }

        item.usb            = typeof product.usb          !== 'undefined' ? _.chain(product.usb).unescape().split(/<br>|[/,•;](?![\dA-z])(?=.*USB)/gi).map(function (o) { return formatUsb(o) }).castArray().uniq().compact().value() : [null]
        item.vga            = typeof product.connectors   !== 'undefined' ? _.chain(product.connectors).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatVga(o) }).castArray().uniq().compact().value() : [null]
        item.dSub           = typeof product.dSub         !== 'undefined' ? [formatDSub(product.dSub)] : []
        if (typeof product.connectors !== 'undefined' && item.dSub.length < 1) { let connectors = _.chain(product.connectors).unescape().split(/<br>|[/,•;](?![\dA-z])/gi).map(function (o) { return formatDSub(o) }).uniq().compact().value(); item.dSub = _.union(item.dSub, connectors) }

        item.rca            = typeof product.connectors   !== 'undefined' ? _.chain(product.connectors).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatRca(o) }).castArray().uniq().compact().value() : [null]
        item.dvi            = typeof product.connectors   !== 'undefined' ? _.chain(product.connectors).split(/<br>|[/,•;](?![\dA-z])/g).map(function (o) { return formatDvi(o) }).castArray().uniq().compact().value() : [null]
        item.image          = typeof product.image        !== 'undefined' ? 'https:' + product.image : null
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

// LCD / LED Monitors Pages
for (var i = 0; i < 27; i++) {
  let urlString = 'www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160979%204814&IsNodeId=1&bop=And&Page=' + i + '&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Touch Screen Monitors Pages
for (i = 1; i < 3; i++) {
  let urlString = 'www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100160980%204814&IsNodeId=1&bop=And&Page=' + i + '&PageSize=96'
  promiseStack.push(scrapeStartPage(urlString))
}

// Execute all of the promises which have been created
Promise.all([promiseStack])
