'use strict';

var express = require('express');
var bodyParser = require('body-parser');

require('app-module-path').addPath(__dirname);

module.exports.createTestApp = function createTestApp(next) {

    require('lasso').configure({
        "plugins": [
            "lasso-marko"
        ],
        "url-prefix": "/static",
        "outputDir": "static",
        "fingerprintsEnabled": true,
        "minify": false,
        "bundlingEnabled": true,
        "resolveCssUrls": true,
        "cacheProfile": "development"
    });

    var app = express();
    app.use('/static', express.static('static'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.get('/page', require('./page'));
    app.all('/json', require('./json'));
    app.options('/json', require('./json'));

    next(app);

};
