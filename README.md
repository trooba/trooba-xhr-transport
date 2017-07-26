# trooba-xhr-transport

[![codecov](https://codecov.io/gh/trooba/trooba-xhr-transport/branch/master/graph/badge.svg)](https://codecov.io/gh/trooba/trooba-xhr-transport)
[![Build Status](https://travis-ci.org/trooba/trooba-xhr-transport.svg?branch=master)](https://travis-ci.org/trooba/trooba-xhr-transport) [![NPM](https://img.shields.io/npm/v/trooba.svg)](https://www.npmjs.com/package/trooba)
[![Downloads](https://img.shields.io/npm/dm/trooba.svg)](http://npm-stat.com/charts.html?package=trooba)
[![Known Vulnerabilities](https://snyk.io/test/github/trooba/trooba-xhr-transport/badge.svg)](https://snyk.io/test/github/trooba/trooba-xhr-transport)

XHR transport for trooba pipeline to make CORS RESTful service calls from the browser.

## Get Involved

- **Contributing**: Pull requests are welcome!
    - Read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) and check out our [bite-sized](https://github.com/trooba/trooba-xhr-transport/issues?q=is%3Aissue+is%3Aopen+label%3Adifficulty%3Abite-sized) and [help-wanted](https://github.com/trooba/trooba-xhr-transport/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Ahelp-wanted) issues
    - Submit github issues for any feature enhancements, bugs or documentation problems
- **Support**: Join our [gitter chat](https://gitter.im/trooba) to ask questions to get support from the maintainers and other Trooba developers
    - Questions/comments can also be posted as [github issues](https://github.com/trooba/trooba-xhr-transport/issues)

## Install

```
npm install trooba-xhr-transport --save
```

## Usage

```js
var xhrTransport = require('trooba-xhr-transport');
require('trooba')
    .use(xhrTransport, {
        protocol: 'http:',
        hostname: 'www.google.com'
        socketTimeout: 1000
    })
    .build()
    .create('client:default')
    .get({
        q: 'nike'
    })
    .set('some', 'header')
    .end(function (err, response) {
        console.log(err, response && response.body)
    });
```

For a real browser example, take a look at [unit test](test/browser.js).
It uses [lasso-js](https://github.com/lasso-js/lasso) and [marko-js](https://github.com/marko-js/marko) to bundle resources into browser page including [trooba xhr implementation](https://github.com/trooba/trooba-xhr-transport/blob/master/test/fixtures/components/app-ajax/index.js#L35). 
