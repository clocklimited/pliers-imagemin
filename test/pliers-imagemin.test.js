var join = require('path').join
  , fs = require('fs')
  , assert = require('assert')
  , createPliers = require('pliers').bind(null, { logLevel: 'error' })
  , pliersImagemin = require('..')
  , rimraf = require('rimraf')
  , async = require('async')
  , copyDir = require('directory-copy')

describe('pliers imagemin', function () {

  beforeEach(function (done) {
    async.waterfall(
      [ function (cb) {
          fs.exists(join(__dirname, 'tmp'), function (exists) {
            cb(null, exists)
          })
        }
      , function (exists, cb) {
          if (!exists) return cb(null)
          rimraf(join(__dirname, 'tmp'), cb)
        }
      ]
      , function () {
        fs.mkdirSync(join(__dirname, 'tmp'))
        copyDir(
          { src: join(__dirname, 'fixtures')
          , dest: join(__dirname, 'tmp')
          , excludes: [ /^\./ ]
          }, done)
      }
    )
  })

  it('should optimize a GIF', function (done) {
    var pliers = createPliers()
      , path = join(__dirname, 'tmp', 'test.gif')
      , original = fs.statSync(path).size
      , result
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    pliers.run('imagemin', function () {
      result = fs.statSync(path).size
      assert(result < original)
      done()
    })
  })

  it('should optimize a JPG', function (done) {
    var pliers = createPliers()
      , path = join(__dirname, 'tmp', 'test.jpg')
      , original = fs.statSync(path).size
      , result
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    pliers.run('imagemin', function () {
      result = fs.statSync(path).size
      assert(result < original)
      done()
    })
  })

  it('should optimize a PNG', function (done) {
    this.timeout(50000)
    var pliers = createPliers()
      , path = join(__dirname, 'tmp', 'test.png')
      , original = fs.statSync(path).size
      , result
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    pliers.run('imagemin', function () {
      result = fs.statSync(path).size
      assert(result < original)
      done()
    })
  })

  it('should optimize a SVG', function (done) {
    var pliers = createPliers()
      , path = join(__dirname, 'tmp', 'test.svg')
      , original = fs.statSync(path).size
      , result
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    pliers.run('imagemin', function () {
      result = fs.statSync(path).size
      assert(result < original)
      done()
    })
  })

  it('should output error on corrupt image', function (done) {
    var pliers = createPliers()
      , path = join(__dirname, 'tmp', 'test-corrupt.jpg')
    pliers.filesets('images', path)
    pliersImagemin(pliers, pliers.filesets.images)
    pliers.run('imagemin', function (error) {
      assert(error.message.match(/Unsupported marker type 0x20/g))
      done()
    })
  })

  afterEach(function (done) {
    rimraf(join(__dirname, 'tmp'), done)
  })

})