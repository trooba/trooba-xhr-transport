'use strict';

var assert = require('assert');
var sinon = require('sinon');
var Service = require('..');

describe(__filename, function() {

    var requestOptions = {
        protocol: 'http:',
        hostname: 'www.ebay.com',
        path: '/jsonpipe'
    };

    describe('verify success scenarios', function() {

        var fakexhr,
            headers = {
                "Content-Type": "application/json",
                "Transfer-Encoding": "chunked"
            };

        before(function() {
            sinon.xhr.supportsXHR = true;
            global.window = {};
            fakexhr = sinon.useFakeXMLHttpRequest();
        });

        after(function() {
            fakexhr.restore();
        });

        it('should process a JSON response with no chunks', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                assert.equal(res.body.id, 7);
                done();
            });

            // increase the chunkSize
            xhr.chunkSize = 20;

            xhr.respond(200, {
                "Content-Type": "application/json"
            }, JSON.stringify({
                "id": 7
            }));
        });

        it('should process 204 response with no content', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err);
                assert.equal(204, res.statusCode);
                assert.equal(undefined, res.body);
                done();
            });

            xhr.respond(204, {
                "Content-Type": "application/json"
            });
        });

        it('should process a JSON response with 1 chunk and ending with \\n\\n', function(done) {
            var count = 1;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 7);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // increase the chunkSize
            xhr.chunkSize = 20;
            xhr.respond(200, headers,
                '{"id": 7}\n\n');
        });

        it('should process a JSON response with 1 chunk and starting with \\n\\n', function(done) {
            var count = 1;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 7);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // increase the chunkSize
            xhr.chunkSize = 20;
            xhr.respond(200, headers,
                '\n\n{"id": 7}');
        });

        it('should process a JSON response with 1 chunk, starting and ending with \\n\\n', function(done) {
            var count = 1;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 7);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // increase the chunkSize
            xhr.chunkSize = 20;
            xhr.respond(200, headers,
                '\n\n{"id": 7}\n\n');
        });

        it('should process a JSON response with 1 chunk, and JSON separated with \\n\\n', function(done) {
            var count = 2;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 2 - count);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // increase the chunkSize
            xhr.chunkSize = 20;
            xhr.respond(200, headers,
                '{"id": 0}\n\n{"id": 1}');
        });

        it('should process a JSON response with multile chunks', function(done) {
            var count = 3;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 3 - count);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // reduce the chunkSize
            xhr.chunkSize = 5;
            xhr.respond(200, headers,
                '{"id": 0}\n\n{"id": 1}\n\n{"id": 2}');
        });

        it('should process a JSON response with multile chunks and bigger buffer size', function(done) {
            var count = 3;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 3 - count);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // reduce the chunkSize
            xhr.chunkSize = 15;
            xhr.respond(200, headers,
                '{"id": 0}\n\n{"id": 1}\n\n{"id": 2}');
        });

        it('should process a JSON response with multile chunks, staring and ending with \\n\\n', function(done) {
            var count = 3;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 3 - count);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // reduce the chunkSize
            xhr.chunkSize = 5;
            xhr.respond(200, headers,
                '\n\n{"id": 0}\n\n{"id": 1}\n\n{"id": 2}\n\n');
        });

        it('should process a JSON response which has Array chunks', function(done) {
            var count = 2;
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.length, 2);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // reduce the chunkSize
            xhr.chunkSize = 5;
            xhr.respond(200, headers,
                '[{"id": 0},{"id": 1}]\n\n[{"id": 2},{"id": 3}]');
        });

        it('should process a multi chunk JSON response separated with the provided option delimiter', function(done) {
            var count = 3;
            var rOptions = Object.create(requestOptions);
            rOptions.delimiter = '\r\r';
            var xhr = Service.invoke(rOptions, function (err, res) {
                assert.ok(!err, err && err.stack);
                if (count > 0) {
                    assert.equal(res.body.id, 3 - count);
                }
                else {
                    assert.equal(res.body, undefined);
                    return done();
                }
                count--;
            });

            // reduce the chunkSize
            xhr.chunkSize = 5;
            xhr.respond(200, headers,
                '\r\r{"id": 0}\r\r{"id": 1}\r\r{"id": 2}\r\r');
        });
    });

    describe('vefiry error scenarios', function() {

        var fakexhr,
            headers = {
                "Content-Type": "application/json",
                "Transfer-Encoding": "chunked"
            };

        before(function() {
            sinon.xhr.supportsXHR = true;
            global.window = {};
            fakexhr = sinon.useFakeXMLHttpRequest();
        });

        after(function() {
            fakexhr.restore();
        });

        it('should call error function on invalid JSON response', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(err);
                assert.equal('parsererror', err.message);
                done();
            });

            xhr.respond(200, headers, '{"id"\n\n}');

        });

        it('should fail once error is encoutered and skipping valid chunk and error on invalid JSON chunk', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(err);
                assert.equal('parsererror', err.message);
                assert.equal('parsererror', err.code);
                assert.equal(500, err.statusCode);
                done();
            });

            xhr.respond(200, headers, '{"id"}\n\n{"id": 1}');

        });

        it('should call error function if timeout exceeded', function(done) {
            var rOptions = Object.create(requestOptions);
            rOptions.socketTimeout = 20;
            var xhr = Service.invoke(rOptions, function (err, res) {
                assert.ok(err);
                assert.equal('ETIMEDOUT', err.code);
                done();
            });

            // Set auto response
            xhr.autoRespond = true;
            xhr.autoRespondAfter = 50;
        });

        it('should call error function on HTTP response code other than 200. e.g. 404', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(err);
                assert.equal('Not Found', err.message);
                assert.equal('Not Found', err.code);
                assert.equal(404, err.statusCode);
                done();
            });

            xhr.respond(404);
        });

        it('should call error function on HTTP response code 400 including service response', function(done) {
            var xhr = Service.invoke(requestOptions, function (err, res) {
                assert.ok(err);
                assert.equal('Bad Request', err.message);
                assert.equal('Bad Request', err.code);
                assert.equal(400, err.statusCode);
                assert.equal('Please provide valid input.', err.response);
                done();
            });
            xhr.respond(400, {}, 'Please provide valid input.');
        });

    });

});
