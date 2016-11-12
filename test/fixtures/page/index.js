'use strict';

var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function index(req, res) {

    template.render({
        endpoint: {
            protocol: 'http:',
            hostname: 'www.test.fake-xyz.com',
            port: 7000,
            path: '/json',
            socketTimeout: 500
        }
    }, res);
};
