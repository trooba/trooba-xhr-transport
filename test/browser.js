/* jshint undef: true, unused: true */
'use strict';

var Async = require('async');
var Assert = require('assert');
var Fs = require('fs');
var supertest = require('supertest');
var App = require('./fixtures');
var Shelljs = require('shelljs');
var Browser = require('zombie');
var xhrTransportFactory = require('..');
var Dns = require('dns');
var _lookup = Dns.lookup;

describe(__filename, function() {
    var _cwd;

    afterEach(function() {
        delete global.window;
    });

    before(function (next) {
        this.timeout(120000);

        Dns.lookup = function (host, some, cb) {
            if (host === 'www.test.fake-xyz.com') {
                cb(null, '127.0.0.1', 4);
                return;
            }
            _lookup.apply(Dns, arguments);
        };

        _cwd = process.cwd();
        var root = __dirname + '/fixtures';
        process.chdir(root);

        if (Fs.existsSync(root + '/static')) {
            Shelljs.rm('-rf', root + '/static/*');
        }
        next();
    });

    after(function() {
        process.chdir(_cwd);
        Dns.lookup = _lookup;
    });

    it('should expose service client into browser', function(done) {
        this.timeout(30000);

        App.createTestApp(function (app) {
            // use timeout to allow meta-router to init routes to avoid breaking request context
            // this will also be fixed with latest request-local
            setTimeout(function () {
                supertest(app).get('/page?headers=true').end(function (err, res) {
                    Assert.ok(!err, err && err.stack);
                    console.log(err, res && res.text);
                    var text = res.text;
                    Assert.ok(text.indexOf("'endpoint':{'protocol':'http:','hostname':'www.test.fake-xyz.com','port':7000,'path':'/json','socketTimeout':500}}") !== -1);
                    done();
                });

            }, 2000);

        });
    });

    describe('app flow', function () {
        var app;
        var svr;

        before(function (next) {
            this.timeout(30000);

            Async.series([
                function createServer(next) {
                    App.createTestApp(function (application) {
                        app = application;
                        next();
                    });
                },
                function startServer(next) {
                    svr = app.listen(7000, next);
                }
            ], next);
        });

        after(function () {
            svr && svr.close();
        });

        it('should do full xhr flow in browser', function(done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                Assert.equal('<div id="xhr-response">{"message":"hello world"}</div>',
                    ctx.browser.html('#xhr-response'));
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            });
        });

        it('should do full xhr flow with origin all in browser', function(done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                Assert.equal('<div id="xhr-response">{"message":"hello world"}</div>',
                    ctx.browser.html('#xhr-response'));
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            }, {
                buttonName: 'Do Xhr Origin All Request',
                originHost: 'www.some.other.com'
            });
        });

        it('should format url', function () {
            var url = xhrTransportFactory.Utils.options2Url({
                method: 'GET',
                search: 'getheaders=true',
                headers: {
                    'x-foo': 'x-bar',
                    'x-qaz': 'x-wsx'
                },
                protocol: 'http:',
                hostname: 'www.test.fake-xyz.com',
                port: 7000,
                path: '/json',
                socketTimeout: 500
            });
            Assert.equal('http://www.test.fake-xyz.com:7000/json?getheaders=true', url);
        });

        it('should do send headers', function(done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                var text = ctx.browser.html('#xhr-response');
                Assert.ok(text.
                    indexOf('"x-foo":"x-bar","x-qaz":"x-wsx"') !== -1);
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            }, {
                buttonName: 'Do Xhr Get Headers'
            });
        });

        it('should do post', function (done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                Assert.equal('<div id="xhr-response">{"foo":"bar"}</div>',
                    ctx.browser.html('#xhr-response'));
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            }, {
                buttonName: 'Do Xhr Post Request'
            });
        });

        it('should do put', function (done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                Assert.equal('<div id="xhr-response">{"foo":"bar"}</div>',
                    ctx.browser.html('#xhr-response'));
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            }, {
                buttonName: 'Do Xhr Put Request'
            });
        });

        it.skip('should do patch', function (done) {
            this.timeout(30000);

            validateXhr(function validate(ctx) {
                Assert.equal('<div id="xhr-response">{"foo":"bar"}</div>',
                    ctx.browser.html('#xhr-response'));
                Assert.equal(1, ctx.countAjaxRequests);
                done();
            }, {
                buttonName: 'Do Xhr Patch Request'
            });
        });

        describe('negative testcases:', function() {
            afterEach(function () {
                delete process.env.TEST_AJAX_NO_RESPONSE;
                delete process.env.TEST_BAD_AJAX_RESPONSE;
                delete process.env.TEST_AJAX_404_RESPONSE;
                delete process.env.TEST_UNKNOWN_HOST;
            });

            it('should handle timeout with xhr', function(done) {
                this.timeout(30000);
                process.env.TEST_AJAX_NO_RESPONSE = 'true';

                validateXhr(function validate(ctx) {
                    Assert.equal('<div id="xhr-response">ERROR: 408</div>',
                        ctx.browser.html('#xhr-response'));
                    Assert.equal(1, ctx.countAjaxRequests);
                    done();
                });

            });

            it('should handle bad response with xhr', function(done) {
                this.timeout(30000);
                process.env.TEST_BAD_AJAX_RESPONSE = 'true';

                validateXhr(function validate(ctx) {
                    Assert.equal('<div id="xhr-response">ERROR: 500</div>',
                        ctx.browser.html('#xhr-response'));
                    Assert.equal(1, ctx.countAjaxRequests);
                    done();
                });
            });

            it('should handle 404 response with xhr', function(done) {
                this.timeout(30000);
                process.env.TEST_AJAX_404_RESPONSE = 'true';

                validateXhr(function validate(ctx) {
                    Assert.equal('<div id="xhr-response">ERROR: 404</div>',
                        ctx.browser.html('#xhr-response'));
                    Assert.equal(1, ctx.countAjaxRequests);
                    done();
                });
            });
        });


    });



});

function validateXhr(validateFn, options) {
    var ctx = {
        countAjaxRequests: 0,
    };
    options = options || {};
    var buttonName = options.buttonName || 'Do Xhr Request';

    Async.series([
        function loadPage(next) {
            var _next = next;
            next = function () {
                _next();
                _next = function noop() {};
            };
            Browser.localhost(options.originHost || 'www.test.fake-xyz.com', 7000);
            var browser = ctx.browser = new Browser();
            browser.debug = true;
            browser.on('xhr', function (event) {
                console.log('xhr:', event);
                if (event === 'loadend') {
                    next();
                }
            });
            browser.on('console', function(level, message) {
                if (/Making Xhr service call.../.test(message) ||
                        /Making Xhr (\w+) service call.../.test(message)) {
                    ctx.countAjaxRequests++;
                }
                else if (message.indexOf('code: \'ETIMEDOUT\'') > 0) {
                    next();
                }
            });
            browser.visit('/page', function startXhr() {
                browser.pressButton(buttonName, function () {});
            });
        },
        function delay(next) {
            setTimeout(next, 500);
        }
    ], function () {
        validateFn(ctx);
    });
}
