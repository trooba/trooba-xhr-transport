'use strict';

var App = require('./index');

App.createTestApp(function (app) {
    var svr = app.listen(7000, function () {
        console.log('Listening on ' + svr.address().port);
    });
});
