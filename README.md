# trooba-xhr-transport

XHR transport for trooba pipeline to make CORS RESTful service calls from the browser.

## Install

```
npm install trooba-xhr-transport --save
```

## Usage

```js
var xhrTransportFactory = require('trooba-xhr-transport');
require('trooba')
    .transport(xhrTransportFactory, {
        protocol: 'http:',
        hostname: 'www.google.com',
        connectTimeout: 100,
        socketTimeout: 1000
    })
    .create()
    .get({
        q: 'nike'
    })
    .set('some', 'header')
    .end(function (err, response) {
        console.log(err, response && response.body)
    });
```
