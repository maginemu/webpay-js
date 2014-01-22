/*global describe:true, it:true, before:true, after:true */
var expect = require('chai').expect;
var sinon = require('sinon');
var http = require('http');
var express = require('express');
var _ = require('lodash');

var helper = require('../helper');

var webpay = require('../../');

describe('webpay.account', function() {
	var server = null;
	before(function() {
		webpay.api_base = 'http://localhost:2121';

		var map = helper.mapResponseForExpress();
		var mock = express();

		mock.use(express.json());
		mock.use(express.urlencoded());

		var response_create_with_card = map['charges/create_with_card'];
		var response_create_with_customer = map['charges/create_with_customer'];

		mock.post('/v1/charges', function(req, res) {
			var r = null;
			if (_.has(req.body, 'card')) {
				r = response_create_with_card;
			} else {
				r = response_create_with_customer;
			}
			delete r.header['Connection'];
			res.set(r.header);
			res.send(r.status, r.body);
		});

		var response_retrieve = map['charges/retrieve'];
		mock.get('/v1/charges/:id', function(req, res) {
			var r = response_retrieve;
			delete r.header['Connection'];
			res.set(r.header);
			res.send(r.status, r.body);
		});


		server = http.createServer(mock).listen(2121);
	});

	after(function() {
		server.close();
	});

	describe('.create', function() {
		it('should return proper object with card', function(done) {
			webpay.client.charge.create({
				amount: '1000',
				currency: 'jpy',
				card: {
					number: '4242-4242-4242-4242',
					exp_month: '12',
					exp_year: '2015',
					cvc: '123',
					name: 'YUUKO SHIONJI'
				},
				description: 'Test Charge from Java'
			}, function(err, res) {
				expect(err).to.not.exists;
				expect(res).to.have.property('id')
					.and.equal('ch_2SS17Oh1r8d2djE');
				expect(res).to.have.property('description')
					.and.equal('Test Charge from Java');
				expect(res).to.have.property('card')
					.and.have.property('name')
					.and.equal('YUUKO SHIONJI');

				done();
			});
		});

		it('should return proper object with customer', function(done) {
			webpay.client.charge.create({
				amount: '1000',
				currency: 'jpy',
				customer: 'cus_fgR4vI92r54I6oK',
				description: 'Test Charge from Java'
			}, function(err, res) {
				expect(err).to.not.exists;
				expect(res).to.have.property('id')
					.and.equal('ch_2SS4fK4IL96535y');
				expect(res).to.have.property('card')
					.and.have.property('name')
					.and.equal('KEI KUBO');

				done();
			});
		});

		describe('.retrieve', function() {
			var id = 'ch_bWp5EG9smcCYeEx';

			it('should return proper object', function() {
				webpay.client.charge.retrieve(id, function(err, res) {

				});
			});
		});

	});

});
