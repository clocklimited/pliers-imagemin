# [pliers](https://pliersjs.github.io/)-imagemin

Minify GIFs, JPGs, PNGs, and SVGs.

[![build status](https://secure.travis-ci.org/pliersjs/pliers-imagemin.png)](http://travis-ci.org/pliersjs/pliers-imagemin)

## Installation

```
npm install pliers-imagemin --save-dev
```

## Usage

Within a `pliers.js` file:

```
module.exports = function (pliers) {
  pliers.filesets('images', join(__dirname, ..., '**/*.{gif,jpg,png,svg}')
  pliers('imagemin', require('pliers-imagemin')(pliers, pliers.filesets.images))
}
```

Then from the CLI:

```
pliers imagemin
```

## Credits
[Ben Edwards](https://github.com/benedfit/)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
