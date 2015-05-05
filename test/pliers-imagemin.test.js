var join = require('path').join
  , assert = require('assert')
  , createPliers = require('pliers').bind(null, { logLevel: 'fatal' })
  , pliersImagemin = require('..')
  , rmdir = require('rimraf')
  , mkdir = require('mkdirp')
  , fs = require('fs')
  , copyDir = require('directory-copy')
  , tempDir = join(__dirname, 'tmp')

describe('pliers imagemin', function () {

  beforeEach('copy fixtures to temp', function (done) {
    rmdir(tempDir, function () {
      mkdir(tempDir, function() {
        copyDir(
          { src: join(__dirname, 'fixtures')
          , dest: tempDir
          , excludes: [ /^\./ ]
          }, done)
      })
    })
  })

  after(function (done) {
    rmdir(tempDir, done)
  })

  it('should error if pliers argument is missing', function (done) {
    var pliers = createPliers()
    assert.throws(function () {
      pliers('imagemin', pliersImagemin(null, null))
    }, /No pliers argument supplied./)
    done()
  })

  it('should error if images argument is missing', function (done) {
    var pliers = createPliers()
    assert.throws(function () {
      pliers('imagemin', pliersImagemin(pliers, null))
    }, /No images argument supplied./)
    done()
  })

  it('should optimize a GIF', function (done) {
    var pliers = createPliers()
      , path = join(tempDir, 'test.gif')
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', path)
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(optimizedSize < originalSize, true)
      done()
    })
  })

  it('should optimize a JPG', function (done) {
    var pliers = createPliers()
      , path = join(tempDir, 'test.jpg')
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', path)
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(optimizedSize < originalSize, true)
      done()
    })
  })

  it('should optimize a PNG', function (done) {
    this.timeout(50000)
    var pliers = createPliers()
      , path = join(tempDir, 'test.png')
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', path)
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(optimizedSize < originalSize, true)
      done()
    })
  })

  it('should optimize an SVG', function (done) {
    var pliers = createPliers()
      , path = join(tempDir, 'test.svg')
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', path)
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(optimizedSize < originalSize, true)
      pliers.run('imagemin', function (error) {
        assert(!error)
        var multipassSize = fs.statSync(path).size
        assert.equal(multipassSize === optimizedSize, true)
        done()
      })
    })
  })

  it('should optimize multiple images', function (done) {
    var pliers = createPliers()
      , path = join(tempDir, '*.{gif,png,jpg,svg}')
      , originalSize = 0
      , optimizedSize = 0
    pliers.filesets('images', path)
    pliers.filesets.images.forEach(function (path) {
      originalSize += fs.statSync(path).size
    })
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      pliers.filesets.images.forEach(function (path) {
        optimizedSize += fs.statSync(path).size
      })
      assert.equal(optimizedSize < originalSize, true)
      done()
    })
  })

  it('should optimize a nested image', function (done) {
    var pliers = createPliers()
      , dir = join(tempDir, 'nested')
      , filename = 'test.gif'
      , path = join(dir, 'nested', filename)
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', join(dir, '**', filename))
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(optimizedSize < originalSize, true)
      done()
    })
  })

  it('should ignore a corrupt image', function (done) {
    var pliers = createPliers()
      , path = join(tempDir, 'test-corrupt.jpg')
      , originalSize = fs.statSync(path).size
      , optimizedSize
    pliers.filesets('images', path)
    pliers('imagemin', pliersImagemin(pliers, pliers.filesets.images))
    pliers.run('imagemin', function (error) {
      assert(!error)
      optimizedSize = fs.statSync(path).size
      assert.equal(originalSize, optimizedSize)
      done()
    })
  })

})
