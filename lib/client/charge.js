/* global module: true */

var _ = require('lodash');

var charge = function(client) {

	var charge = {

		/**
		 * @param {Any} obj
		 * @return {boolean}
		 */
		_isChargeLike: function(obj) {
			return _.has(obj, 'id');
		},

		/**
		 * @param {Object|String} charge
		 * @return {String}
		 */
		_toChargeId: function(charge) {
			if (_.isString(charge)) {
				return charge;
			} else if (this._isChargeLike(charge)) {
				return charge.id;
			} else {
				return '';
			}
		},


		/**
		 * @param {Object} params
		 * @param {int} params.amount
		 * @param {String} params.currency
		 * @param {String} [params.customer]
		 * @param {Object} [params.card]
		 * @param {String} [params.description=null]
		 * @param {Boolean} [params.capture=true]
		 * @param {String} [params.uuid=null]
		 * @param {Function} callback
		 */
		create: function(params, callback) {
			var path = client._basePath() + '/charges';
			callback = callback || function() {};
			return client._execute('post', path, {data: params}, callback);
		},

		/**
		 * @param {String} chargeId
		 * @param {Function} callback
		 */
		retrieve: function(chargeId, callback) {
			var path = client._basePath() + '/charges/' + chargeId;
			callback = callback || function() {};
			return client._execute('get', path, {}, callback);
		},

		/**
		 * @param {Object|String} charge
		 * @param {Function} callback
		 */
		refund: function(charge, callback) {
			var path = client._basePath() + '/charges/' + this._toChargeId(charge) + '/refund';
			callback = callback || function() {};
			return client._execute('post', path, {}, callback);
		},

		/**
		 * @param {Object|String} charge
		 * @param {Function} callback
		 */
		capture: function(charge, callback) {
			var path = client._basePath() + '/charges/' + this._toChargeId(charge) + '/capture';
			callback = callback || function() {};
			return client._execute('post', path, {}, callback);
		}
	};
	return charge;
};


module.exports = charge;
