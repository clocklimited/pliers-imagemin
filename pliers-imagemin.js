var async = require('async')
  , path = require('path')
  , chalk = require('chalk')
  , fs = require('fs')
  , Imagemin = require('imagemin')
  , prettyBytes = require('pretty-bytes');

module.exports = function (pliers, images) {
  pliers('imagemin', function (done) {
    var totalBytes = 0
      , totalSavedBytes = 0
      , totalFiles = 0
      , percent
      , msg

    async.each(images, optimize, function (err) {
      if (err) return done(err)

      percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0

      msg = 'Minified ' + totalFiles + ' '
      msg += totalFiles === 1 ? 'image' : 'images'
      msg += chalk.gray(' (saved ' + prettyBytes(totalSavedBytes) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%)')

      pliers.logger.info(msg)

      done()
    })

    function optimize(image, cb) {
      var imagemin = new Imagemin()
          .src(image)
          .dest(image)
          .use(Imagemin.gifsicle({interlaced: true}))
          .use(Imagemin.jpegtran({progressive: true}))
          .use(Imagemin.optipng({optimizationLevel: 7}))
          .use(Imagemin.svgo({plugins: []}))
        , originalSize = fs.statSync(image).size

      imagemin.optimize(function (err, data) {
        if (err) return done(err)

        var optimizedSize = data.contents.length
          , saved = originalSize - optimizedSize
          , percent = originalSize > 0 ? (saved / originalSize) * 100 : 0
          , savedMsg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%'
          , msg = saved > 0 ? savedMsg : 'already optimized'

        totalBytes += originalSize
        totalSavedBytes += saved
        totalFiles++

        // Provide verbose flag

        pliers.logger.info(chalk.green('✔ ') + path.relative(pliers.cwd, image) + chalk.gray(' (' + msg + ')'))

        cb()
      })
    }
  })
}