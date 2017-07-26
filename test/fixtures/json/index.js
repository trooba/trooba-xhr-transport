'use strict';

module.exports = function json(req, res) {
    if (process.env.TEST_AJAX_NO_RESPONSE) {
        return;
    }

    if (req.query.originAll) {
        res.header('Access-Control-Allow-Origin', req.query.originAll);
    }
    else {
        res.header('Access-Control-Allow-Origin', 'http://www.test.fake-xyz.com');
    }
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Access-Control-Allow-Origin');
    res.header('Access-Control-Expose-Headers', 'X-Firefox-Spdy, Transfer-Encoding');
    if (req.method === 'OPTIONS') {
        res.end();
        return;
    }

    if (process.env.TEST_AJAX_404_RESPONSE) {
        return res.status(404).end('Bad response');
    }

    if (process.env.TEST_BAD_AJAX_RESPONSE) {
        return res.status(200).end('{Bad response');
    }

    var model = {
        message: 'hello world'
    };

    if (/POST|PUT|PATCH/.test(req.method)) {
        res.json(req.body);
        return;
    }

    if (req.query.getheaders === 'true') {
        res.json(req.headers);
        return;
    }

    res.json(model);
};
