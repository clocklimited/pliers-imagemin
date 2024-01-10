var async = require('async')
  , chalk = require('chalk')
  , fs = require('fs')
  , imagemin = require('imagemin')
  , gifsicle = require('imagemin-gifsicle')
  , jpegtran = require('imagemin-jpegtran')
  , optipng = require('imagemin-optipng')
  , svgo = require('imagemin-svgo')
  , os = require('os')
  , path = require('path')
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

    function log(icon, filePath, msg) {

      pliers.logger.info(icon + ' ' + filePath + chalk.gray(' (' + msg + ')'))

    }

    function optimize(image, next) {
      var originalSize = fs.statSync(image).size
          , filePath = path.relative(pliers.cwd, image)
          , msg

        imagemin([ image ], path.dirname(image), {
          plugins: [
            jpegtran(options)
            , gifsicle(options)
            , optipng(options)
            , svgo(options)
          ]
        }).then(function (files) {
          var file = files[0]
            , optimizedSize = file.contents.length
            , saved = originalSize - optimizedSize
            , percent = (saved / originalSize) * 100
            , icon = chalk.cyan('•')

          msg = 'already optimized'

          if (saved > 0) {
            icon = chalk.green('✔')
            msg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%'
          }

          totalBytes += originalSize
          totalSavedBytes += saved
          totalFiles++

          log(icon, filePath, msg)

          process.nextTick(next)
        }).catch(function (err) {
          msg = err.message.replace(/(\r\n|\n|\r)/gm, ' ')

          log(chalk.red('✘'), filePath, msg)

          return next()
        })
    }
  }
}
