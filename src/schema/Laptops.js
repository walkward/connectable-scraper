/**
 * Laptops Schema
 * @kind {Key!} key
 * @kind {@Brands!} brand
 * @kind {String!} model
 * @kind {String} series
 * @kind {String} partNumber             - The manufacturerers part number (Not to be confused with the suppliers/scraped page part number)
 * @kind {Date!} dateUpdated             - The date when the page was scraped. Should be updated after each scrape.
 * @kind {Url} image                     - Should be a properly formatted url (including protocol)
 * @kind {String} category               - Defaults to the category name unless the scraped page provides more descriptive category.
 * @kind {String} wlan                   - The 802.11 Specification
 * @kind {Integer} acAdapter             - Expressed in Watts
 * @kind {@bluetooth} bluetooth
 * @kind {[@hdmi]} hdmi
 * @kind {[@usb]} usb
 * @kind {[@displayPort]} displayPort
 * @kind {@vga} vga
 * @kind {@thunderbolt} thunderbolt
 * @kind {@primaryPower} primaryPower
 * @kind {[@dvi]} dvi
 * @kind {[@toslink]} toslink
 * @kind {[@stereoJack]} stereoJack
 * @kind {[@rca]} rca
 * @kind {@firewire} firewire
 * @kind {Boolean} spdif
 * @kind {Boolean} serialPort
 * @kind {Boolean} parallelPort
 * @kind {Boolean} esata
 * @kind {Boolean} dockingPort
 * @kind {Boolean} ir
 * @kind {Boolean} rj45
 * @kind {Url!} scrapedUrl                 - Url of the page scraped
 * @kind {Url!} scrapedHost                - Host basename for the page scraped
 * @kind {Object!} scrapedArchive          - The original object used to scrape data.
 */

module.exports = {
  brand: null,
  model: null,
  series: null,
  partNumber: null,
  dateUpdated: JSON.stringify(new Date()),
  image: null,
  category: 'Laptop',
  wlan: null,
  acAdapter: null,
  bluetooth: null,
  hdmi: [],
  usb: [],
  displayPort: [],
  vga: null,
  thunderbolt: null,
  primaryPower: null,
  dvi: [],
  toslink: [],
  // rca: [],
  stereoJack: [],
  firewire: null,
  spdif: null,
  dockingPort: null,
  serialPort: null,
  parallelPort: null,
  esata: null,
  ir: null,
  rj45: null,
  scrapedUrl: null,
  scrapedHost: null,
  scrapedArchive: {}
}
