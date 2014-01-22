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
	var mock = null;
	var res_map = helper.mapResponseForExpress();
	before(function() {
		webpay.api_base = 'http://localhost:2121';
		var map = res_map;
		mock = express();

		mock.use(express.json());
		mock.use(express.urlencoded());

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
		before(function() {
			var response_create_with_card = res_map['charges/create_with_card'];
			var response_create_with_customer = res_map['charges/create_with_customer'];

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
		});

		it('should create a charge with card', function(done) {
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

		it('should create a charge with customer', function(done) {
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

			it('should retrieve proper charge', function(done) {
				webpay.client.charge.retrieve(id, function(err, res) {
					expect(res).to.have.property('id').and.equal(id);
					expect(res).to.have.property('card').and.have.property('fingerprint')
					.and.equal('215b5b2fe460809b8bb90bae6eeac0e0e0987bd7');
					done();
				});
			});
		});

		describe('.all', function() {
			it('should return proper list with created[gt]');
			it('should return proper list with customer');
		});


		describe('.refund', function() {
			var refundHandler = null;
			var spy = null;
			before(function() {
				var response_refund = res_map['charges/refund'];
				refundHandler = function(req, res) {
					var r = response_refund;
					delete r.header['Connection'];
					res.set(r.header);
					res.send(r.status, r.body);
				};
				spy = sinon.spy(refundHandler);

				mock.post('/v1/charges/:id/refund', spy);

			});

			after(function() {

			});

			var id = 'ch_bWp5EG9smcCYeEx';
			it('should refund the retrieved charge', function(done) {
				webpay.client.charge.retrieve(id, function(err, charge) {
					expect(charge).to.have.property('refunded').and.to.be.false;
					webpay.client.charge.refund(charge, {amount: 400}, function(err, refundedCharge) {
						expect(refundedCharge.refunded).to.be.true;
						expect(spy.args[0][0].body.amount).to.equal(400);
						done();
					});
				});
			});


			it('should refund the charge of specified id', function(done) {
				webpay.client.charge.refund(id, {amount: 400}, function(err, refundedCharge) {
					expect(refundedCharge.refunded).to.be.true;
					expect(spy.args[0][0].body.amount).to.equal(400);
					done();
				});
			});

			it('should refund the charge of specified id without amount', function(done) {
				webpay.client.charge.refund(id, function(err, refundedCharge) {
					expect(refundedCharge.refunded).to.be.true;
					done();
				});
			});

		});

	});

});
