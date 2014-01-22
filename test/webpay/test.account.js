/*global describe:true, it:true, before:true, after:true */
var expect = require('chai').expect;
var sinon = require('sinon');
var http = require('http');
var express = require('express');
var helper = require('../helper');

var webpay = require('../../');

describe('webpay.account', function() {
	var server = null;
	before(function() {
		webpay.api_base = 'http://localhost:2121';
		var map = helper.mapResponseForExpress();
		var mock = express();

		var response_retrieve = map['account/retrieve'];
		mock.get('/v1/account/retrieve', function(req, res) {
			var r = response_retrieve;
			delete r.header['Connection'];
			res.set(r.header);
			res.send(r.status, r.body);
		});

		var response_delete = map['account/delete'];
		mock.del('/v1/account/delete/data', function(req, res) {
			var r = response_delete;
			delete r.header['Connection'];
			res.set(r.header);
			res.send(r.status, r.body);
		});

		server = http.createServer(mock).listen(2121);
	});

	after(function() {
		server.close();
	});


	describe('.retrieve', function() {
		it('expected to retrieve account object', function(done) {
			webpay.client.account.retrieve(function(err, res) {
				expect(err).to.be.null;
				expect(res).to.have.property('object').and.eql('account');
				expect(res).to.have.property('id').and.eql('acct_2Cmdexb7J2r78rz');
				expect(res).to.have.property('email').and.eql('test-me@example.com');
				expect(res).to.have.property('currencies_supported').and.eql(['jpy']);
				done();
			});
		});
	});

	describe('.delete', function() {
		it('expected to return true', function(done) {
			webpay.client.account.delete(function(err, res) {
				expect(err).to.be.null;
				expect(res).to.be.true;
				done();
			});
		});
	});
});
