'use strict';

var template = require('marko').load(require.resolve('./template.marko'));
var Trooba = require('trooba');
var xhrTransport = require('../../../..');

module.exports = require('marko-widgets').defineComponent({
    template: template,

    getTemplateData: function(state) {
        return {
            time: state.time,
            response: state.response,
            model: state.model
        };
    },

    getInitialState: function(input) {
        return {
            time: 0,
            response: 'Empty',
            endpoint: input.model.endpoint
        };
    },

    init: function(config) {
        // this.el will be the raw DOM element the widget instance
        // is bound to:
        this.config = config;
        var el = this.el;
    },

    makeAjax: function(type, options) {
        var self = this;
        var client = Trooba.transport(xhrTransport, this.state.endpoint).create();
        var st = Date.now();
        options = options || {};
        var method = options.method || 'get';
        var request = client[method](options.params || {
            foo: 'bar'
        });

        if (options.headers) {
            Object.keys(options.headers).forEach(function forEach(key) {
                request.set(key, options.headers[key]);
            });
        }

        request.end(function handleResponse(err, res) {
            console.log('Got service response:', err || res);
            if (err) {
                self.setState('response', 'ERROR: ' + (err.statusCode || err.code || err.message));
            }
            else if (!res) {
                self.setState('response', 'ERROR: unknown');
            }
            else {
                self.setState('response', JSON.stringify(res.body));
            }
            self.setState('time', Date.now() - st);
        });
    },

    makeXhrCall: function(event) {
        console.log('Making Xhr service call...');
        this.makeAjax('xhr');
    },

    makeXhrHeadersCall: function(event) {
        console.log('Making Xhr Headers service call...');
        this.makeAjax('xhr', {
            headers: {
                'x-foo': 'x-bar',
                'x-qaz': 'x-wsx'
            },
            params: {
                getheaders: 'true'
            }
        });
    },

    makeXhrPostCall: function(event) {
        console.log('Making Xhr Post service call...');
        this.makeAjax('xhr', {
            method: 'post'
        });
    },

    makeXhrPutCall: function(event) {
        console.log('Making Xhr Put service call...');
        this.makeAjax('xhr', {
            method: 'put',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    },

    makeXhrPatchCall: function(event) {
        console.log('Making Xhr Patch service call...');
        this.makeAjax('xhr', {
            method: 'patch',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

});
