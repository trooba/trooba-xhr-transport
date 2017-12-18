/*jslint browser: true*/
'use strict';

var Jsonpipe = require('jsonpipe');
var httpfy = require('trooba-http-api');

/**
 * Ajax/XHR trooba transort for browser side service calls
*/
module.exports = function xhr(pipe, config) {
    pipe.on('request', function onRequest(request) {
        request = Utils.mixin(config,
            request, {});

        invoke(request, function onResponse(err, response) {
            if (err) {
                pipe.throw(err);
                return;
            }

            Utils.deserializeResponseHeaders(response);
            pipe.respond(response);
        });
    });

    httpfy(pipe);
};

function invoke(options, callback) {
    var headers = options.headers ? Object.create(options.headers) : {};
    headers['X-Requested-With'] = 'XMLHttpRequest';
    var err;

    var url = Utils.options2Url(options);
    var _isChunked = false;
    var resHeaders;
    var config = {
        success: function success(data) {
            if (err) {
                return;
            }

            _isChunked = Utils.isChunked(xhr);

            resHeaders = resHeaders || (xhr.getAllResponseHeaders() || '');

            callback(null, {
                statusCode: 200,
                body: data,
                headers: resHeaders
            });
        },
        error: Utils.once(function error(errorMsg) {
            if (err) {
                return;
            }
            if (errorMsg === 'ETIMEDOUT') {
                err = new Error('Connection timeout');
                err.code = 'ETIMEDOUT';
                err.statusCode = 408;
            }
            else {
                err = new Error(errorMsg || 'Resource not found');
                err.code = errorMsg;
                if(errorMsg === 'parsererror') {
                    err.statusCode = 500;
                } else if(errorMsg === 'Bad Request') {
                    err.statusCode = 400;
                } else {
                    err.statusCode = 404;
                }
                err.response = xhr && xhr.response;
            }
        }),
        complete: Utils.once(function complete(statusText) {
            if (err) {
                return callback(err);
            }
            // 3XX responses are treated as error by jsonpipe
            if (xhr && (xhr.status > 200 && xhr.status < 300)) {
                resHeaders = resHeaders || (xhr.getAllResponseHeaders() || '');
                callback(null, {
                    statusCode: xhr.status,
                    headers: resHeaders
                });
            }
            // only do second callback when it is chunked
            if (_isChunked) {
                callback(null, {
                    statusCode: 200,
                    headers: resHeaders,
                    body: undefined
                });
            }
        }),
        timeout: options.socketTimeout, // Number. Set a timeout (in milliseconds) for the request
        method: options.method || 'GET', // String. The type of request to make (e.g. 'POST', 'GET', 'PUT'); default is 'GET'
        headers: headers,
        withCredentials: options.withCredentials,
        data: typeof options.body === 'string' ?
            options.body : options.body !== undefined ?
                httpfy.Utils.stringifyQuery(options.body) : undefined,
        delimiter: options.delimiter
    };

    var xhr = Jsonpipe.flow(url, config);

    // since abort stops any activity and events (in some browsers), we need to simulate
    // the timeout events to complete the flow
    xhr.abort = (function interceptAbort(original) {
        return function abort() {
            // make sure json pipe get correct error code
            err = new Error('Connection timeout');
            err.code = 'ETIMEDOUT';
            err.statusCode = 408;
            original.apply(xhr, arguments);
            config.complete();
        };
    })(xhr.abort);

    return xhr;
}

module.exports.invoke = invoke;

var Utils = {
    isChunked: function isChunked(xhr) {
        var chunked = xhr.getResponseHeader('Transfer-Encoding');
        if (chunked === 'chunked') {
            return true;
        }

        var chromeObj = window.chrome;
        var loadTimes = chromeObj && chromeObj.loadTimes && chromeObj.loadTimes();
        var chromeSpdy = loadTimes && loadTimes.wasFetchedViaSpdy;
        return !!(xhr.getResponseHeader('X-Firefox-Spdy') || chromeSpdy);
    },

    options2Url: function options2Url(options) {
        return (options.protocol || 'http:') + '//' +
            options.hostname +
            (options.port ? (':' + options.port) : '') +
            (options.basepath ? '/' + this.unslash(options.basepath) : '') +
            (options.path ? '/' + this.unslash(options.path) : '') +
            (options.search ?
                '?' + (typeof options.search === 'string' ?
                    options.search :
                    httpfy.Utils.stringifyQuery(options.search)) : '');
    },

    unslash: function unslash(path) {
        return path.replace(/(^\/|\/$)/, '');
    },

    once: function once(fn) {
        var called;
        return function () {
            if (called) {
                return;
            }
            called = true;
            fn.apply(null, arguments);
        };
    },

    mixin: function mixin(src, target) {
        if (src && typeof src === 'object' && target && typeof target === 'object') {
            target = target || {};
            Object.keys(src).forEach(function (key) {
                var srcVal = src[key];
                var targetVal = target[key];
                target[key] = mixin(srcVal, targetVal);
            });
            return target;
        }
        return src || target;
    },

    deserializeResponseHeaders: function deserializeResponseHeaders(response) {
        if (response && response.headers && typeof response.headers === 'string') {
            response.headers = response.headers.split(/\n/)
                .reduce(function reduce(memo, kvp) {
                    var parts = kvp.split(':');
                    if (parts.length > 1) {
                        memo[parts.shift().trim()] = parts.join(':').trim();
                    }
                    return memo;
                }, {});
        }
    }
};

module.exports.Utils = Utils;
