const algoliasearch = require('algoliasearch')
const fs = require('fs')
var ldj = require('ldjson-stream')

const client = algoliasearch('F90WOGD1GY', '4c563ccc4b9ed8f99fb96f1edec5b8b0')
const index = client.initIndex('master')

// Writing the data to Alogilia for indexing
fs.createReadStream('../../data/MonitorsAlgolia.json')
  .pipe(ldj.parse())
  .on('data', function (obj) {
    index.addObject({
      objectID: obj.id,
      keywords: obj.keywords,
      image: obj.image,
      title: obj.title
    }, function (err, content) {
      console.log('objectID=' + content.objectID)
      if (err) {
        console.log('Error:' + err)
      }
    })
  })

// const chunks = _.chunk(records, 1000)
//
// chunks.map(function (batch) {
//   return index.addObjects(batch)
// })
