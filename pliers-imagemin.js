var async = require('async')
  , path = require('path')
  , chalk = require('chalk')
  , fs = require('fs')
  , Imagemin = require('imagemin')
  , prettyBytes = require('pretty-bytes')

module.exports = function (pliers, images) {

  // Check supplied arguments
  if (!pliers) throw new Error('No pliers argument supplied.')
  if (!pliers.version) throw new Error('You need pliers >=0.3.4 to use this plugin')
  if (!images) throw new Error('No images argument supplied.')

  return function (done) {

    var totalBytes = 0
      , totalSavedBytes = 0
      , totalFiles = 0
      , percent
      , msg

    async.each(images, optimize, function () {
      percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0

      msg = 'Minified ' + totalFiles + ' '
      msg += totalFiles === 1 ? 'image' : 'images'
      msg += chalk.gray(' (saved ' + prettyBytes(totalSavedBytes) + ' - ' +
        percent.toFixed(1).replace(/\.0$/, '') + '%)')

      pliers.logger.info(msg)

      done()
    })

    function optimize(image, cb) {
      var imagemin = new Imagemin()
          .src(image)
          .dest(path.dirname(image))
          .use(Imagemin.gifsicle({ interlaced: true }))
          .use(Imagemin.jpegtran({ progressive: true }))
          .use(Imagemin.optipng({ optimizationLevel: 7 }))
          .use(Imagemin.svgo({ multipass: true }))
        , originalSize = fs.statSync(image).size
        , filePath = path.relative(pliers.cwd, image)
        , msg

      imagemin.run(function (err, data) {
        if (err) {
          msg = err.message.replace(/(\r\n|\n|\r)/gm, ' ')

          pliers.logger.info(chalk.red('✘ ') + filePath + chalk.gray(' (' + msg + ')'))
        } else {
          var optimizedSize = data[ 0 ].contents.length
            , saved = originalSize - optimizedSize
            , percent = originalSize > 0 ? (saved / originalSize) * 100 : 0
            , savedMsg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%'

          msg = saved > 0 ? savedMsg : 'already optimized'
          totalBytes += originalSize
          totalSavedBytes += saved
          totalFiles++

          pliers.logger.info(chalk.green('✔ ') + filePath + chalk.gray(' (' + msg + ')'))
        }

        cb()

      })

    }

  }

}
