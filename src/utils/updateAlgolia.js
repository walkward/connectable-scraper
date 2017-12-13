const fs = require('fs')
const path = require('path')
const algoliasearch = require('algoliasearch')
var ldj = require('ldjson-stream')

const client = algoliasearch('F90WOGD1GY', '4c563ccc4b9ed8f99fb96f1edec5b8b0')
const index = client.initIndex('master')

// Writing the data to Alogilia for indexing
fs.createReadStream(path.resolve('./data/AlgoliaMaster.json'))
  .pipe(ldj.parse())
  .on('data', function (obj) {
    index.addObject({
      objectID: obj.id,
      image: obj.image,
      title: obj.title,
      model: obj.model,
      partNumber: obj.partNumber,
      brand: obj.brand,
      series: obj.series,
      category: obj.category
    }, function (err, content) {
      console.log('objectID=' + content.objectID)
      if (err) {
        console.log('Error:' + err)
      }
    })
  })
