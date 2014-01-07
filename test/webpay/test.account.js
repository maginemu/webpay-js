/*global describe:true, it:true, before:true, after:true */
var expect = require('chai').expect;
var sinon = require('sinon');
var http = require('http');
var express = require('express');
var helper = require('../helper');

var webpay = require('../../');

describe('webpay.account', function() {
	describe('.retrieve', function() {
		var server = null;
		before(function() {
			webpay.api_base = 'http://localhost:2121';
			var map = helper.mapResponseForExpress();
			var mock = express();

			var response = map['account/retrieve'];
			mock.get('/v1/account/retrieve', function(req, res) {
				delete response.header['Connection'];
				res.set(response.header);
				console.log('res.set:', response.header);

				res.send(response.status, response.body);

				console.log('res.send:', response.status, response.body);

			});
			server = http.createServer(mock).listen(2121);
		});

		after(function() {
			server.close();
		});

		it('expected to retrieve account object', function(done) {
			webpay.client.account().retrieve(function(err, res) {
				console.log(err, res);
				done();
			});
		});
	});
});
