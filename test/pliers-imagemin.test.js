var join = require('path').join
  , fs = require('fs')
  , assert = require('assert')
  , createPliers = require('pliers').bind(null, { cwd: join(__dirname, 'output'), logLevel: 'error' })
  , pliersImagemin = require('..')

describe('pliers imagemin', function () {
  it('should optimize a GIF', function (done) {
    var pliers = createPliers()
      , path = join(__dirname, 'fixtures', 'test.gif')
      , originalPath = join(__dirname, 'fixtures', 'original', 'test.gif')
      , original = fs.statSync(originalPath).size
      , result
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    result = fs.statSync(path).size
    assert(result < original, 'original:' + original + ' result:' + result)
    done()
  })
})