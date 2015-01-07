# [pliers](https://pliersjs.github.io/)-imagemin

Minify GIFs, JPGs, PNGs, and SVGs.

[![build status](https://secure.travis-ci.org/pliersjs/pliers-imagemin.png)](http://travis-ci.org/pliersjs/pliers-imagemin)

## Installation

      npm install pliers-imagemin

## Usage

This will expose a new pliers task.

```js
// within a pliers.js
module.exports = function (pliers) {

  pliers.filesets('images', join(__dirname, ..., '**/*.{gif,jpg,png,svg}')

  require('pliers-imagemin')(pliers, pliers.filesets.images)

}
```

Then from the cli:

```
pliers imagemin
```

## Credits
[Ben Edwards](https://github.com/benedfit/) follow me on twitter [@benedfit](https://twitter.com/benedfit)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
