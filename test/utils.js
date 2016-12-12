'use strict';

var Assert = require('assert');

var Utils = require('..').Utils;

describe(__filename, function () {
    it('should once the function', function () {
        var count = 0;
        function fn() {
            count++;
        }

        var f = Utils.once(fn);
        f();
        f();
        Assert.equal(1, count);
    });

    it('should unslash', function () {
        var path = '/path/to/resource';
        Assert.equal('path/to/resource', Utils.unslash(path));
    });

    it('should mixin', function () {
        var src = {
            foo: 'bar',
            qaz: {
                das: 'rgh'
            },
            arr: [1, 2, 3]
        };
        var result = Utils.mixin(src, {});
        Assert.deepEqual(src, result);

        result = Utils.mixin(src, {
            foo: 'bar1'
        });
        Assert.deepEqual(src, result);

        result = Utils.mixin(src, {
            foo: 'bar1',
            dfg: 'asd'
        });
        Assert.deepEqual({
            foo: 'bar',
            dfg: 'asd',
            qaz: {
                das: 'rgh'
            },
            arr: [1, 2, 3]
        }, result);

        result = Utils.mixin(src, {
            foo: 'bar1',
            dfg: 'asd',
            qaz: {
                das: 'rgh1',
                asd: 'azx'
            }
        });
        Assert.deepEqual({
            foo: 'bar',
            dfg: 'asd',
            qaz: {
                das: 'rgh',
                asd: 'azx'
            },
            arr: [1, 2, 3]
        }, result);

        result = Utils.mixin(src, {
            foo: 'bar1',
            dfg: 'asd',
            qaz: {
                das: 'rgh1',
                asd: 'azx'
            },
            arr: [4]
        });
        Assert.deepEqual({
            foo: 'bar',
            dfg: 'asd',
            qaz: {
                das: 'rgh',
                asd: 'azx'
            },
            arr: [1, 2, 3]
        }, result);

        result = Utils.mixin(src, {
            foo: 'bar1',
            dfg: 'asd',
            qaz: {
                das: 'rgh1',
                asd: 'azx'
            },
            arr: 4
        });
        Assert.deepEqual({
            foo: 'bar',
            dfg: 'asd',
            qaz: {
                das: 'rgh',
                asd: 'azx'
            },
            arr: 4
        }, result);
    });

    it('should deserializeResponseHeaders', function () {
        var res = {
            headers: 'foo:bar\nqaz:edc\nrfv:tgb'
        };
        Utils.deserializeResponseHeaders(res);
        Assert.deepEqual({
            foo: 'bar',
            qaz: 'edc',
            rfv: 'tgb'
        }, res.headers);

        res = {
            headers: 'foo=dfg'
        };
        Utils.deserializeResponseHeaders(res);
        Assert.deepEqual({}, res.headers);
    });

});
