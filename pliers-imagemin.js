var async = require('async')
  , path = require('path')
  , chalk = require('chalk')
  , fs = require('fs')
  , Imagemin = require('imagemin')
  , os = require('os')
  , prettyBytes = require('pretty-bytes')

module.exports = function (pliers, images) {

  // Check supplied arguments
  if (!pliers) throw new Error('No pliers argument supplied.')
  if (!images) throw new Error('No images argument supplied.')

  return function (done) {

    var totalBytes = 0
      , totalSavedBytes = 0
      , totalFiles = 0
      , options =
        { interlaced: true
        , multipass: true
        , optimizationLevel: 7
        , progressive: true
        }
      , percent
      , msg

    async.eachLimit(images, os.cpus().length, optimize, function () {
      percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0

      msg =
        [ 'Minified ' + totalFiles
        , totalFiles === 1 ? 'image' : 'images'
        , chalk.gray('(saved ' + prettyBytes(totalSavedBytes))
        , '-'
        , chalk.gray(percent.toFixed(1).replace(/\.0$/, '') + '%)')
        ]

      pliers.logger.info(msg.join(' '))

      done()
    })

    function optimize(image, next) {
      var imagemin = new Imagemin()
          .src(image)
          .dest(path.dirname(image))
          .use(Imagemin.jpegtran(options))
          .use(Imagemin.gifsicle(options))
          .use(Imagemin.optipng(options))
          .use(Imagemin.svgo(options))
        , originalSize = fs.statSync(image).size
        , filePath = path.relative(pliers.cwd, image)
        , msg

      imagemin.run(function (err, data) {
        if (err) {
          msg = err.message.replace(/(\r\n|\n|\r)/gm, ' ')

          pliers.logger.info(chalk.red('✘ ') + filePath + chalk.gray(' (' + msg + ')'))

          return next()
        } else {
          var optimizedSize = data[ 0 ].contents.length
            , saved = originalSize - optimizedSize
            , percent = (saved / originalSize) * 100
            , savedMsg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%'

          msg = saved > 0 ? savedMsg : 'already optimized'
          totalBytes += originalSize
          totalSavedBytes += saved
          totalFiles++

          pliers.logger.info(chalk.green('✔ ') + filePath + chalk.gray(' (' + msg + ')'))

          process.nextTick(next)
        }

      })

    }

  }

}
