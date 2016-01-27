var chalk = require('chalk')
  , fs = require('fs')
  , Imagemin = require('imagemin')
  , path = require('path')
  , prettyBytes = require('pretty-bytes')

module.exports = function (pliers, images) {

  // Check supplied arguments
  if (!pliers) throw new Error('No pliers argument supplied.')
  if (!images) throw new Error('No images argument supplied.')

  return function (done) {

    if (!images.length) return done()

    var options =
        { interlaced: true
        , multipass: true
        , optimizationLevel: 7
        , progressive: true
        }

    new Imagemin()
        .src(images)
        .use(Imagemin.jpegtran(options))
        .use(Imagemin.gifsicle(options))
        .use(Imagemin.optipng(options))
        .use(Imagemin.svgo(options))
        .run(function (err, files) {
          if (err) return done(err)

          var totalBytes = 0
            , totalSavedBytes = 0
            , totalFiles = files.length
            , percent
            , msg

          files.forEach(function (file, index) {
            var original = images[ index ]
              , originalSize = fs.statSync(original).size
              , filePath = path.relative(pliers.cwd, original)
              , optimizedSize = file.contents.length
              , saved = originalSize - optimizedSize
              , percent = (saved / originalSize) * 100
              , savedMsg = 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%'

            if (saved > 0) {
              fs.writeFileSync(original, file.contents)
            }

            savedMsg = saved > 0 ? savedMsg : 'already optimized'
            totalBytes += originalSize
            totalSavedBytes += saved

            pliers.logger.info(chalk.green('✔ ') + filePath + chalk.gray(' (' + savedMsg + ')'))
          })

          percent = (totalSavedBytes / totalBytes) * 100

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

  }

}
