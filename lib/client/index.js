var request = require('superagent');
var WebpayJsError = require('../error');
//var config = require('config');

var VERSION = 'test';

var WebPayClient = function(api_key, api_base, api_version) {
	var self = this;
	//var ssOpts = {'ca_file': config['ssl_ca_file']};

	self.api_key = api_key;
	self.api_base = api_base;
	self.api_version = api_version;

	self.defaultHeaders = {
		'Authorization': 'Bearer ' + api_key,
		'User-Agent': 'WebPay' + api_version + ' JavascriptBinding/' + VERSION
	};
};

WebPayClient.prototype = {

	account: require('./account'),

	_basePath: function() {
		var self = this;
		return self.api_base + self.api_version;
	},

	_execute: function(method, path, params, callback) {
		var self = this;
		if (!callback) {
			callback = function() {};
		}

		var req = request[method](path);

		if (params.query) {
			req.query(params.query);
		}

		req.set(self.defaultHeaders);

		if (params.header) {
			req.set(params.header);
		}

		req.end(function(err, res) {
			if (err) {
				return callback(new WebpayJsError(err));
			}
			if (200 <= res.status && res.status < 300) {
				return callback(null, res.body);
			} else {
				var e = new WebpayJsError(res.status + ', ' + res.body);
				e.status = res.status;
				e.body = res.body;
				return callback(e);
			}
		});
	}
};


module.exports = WebPayClient;
