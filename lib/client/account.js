/*global module: true */

var account = function() {
	var self = this;
	var account = {

		retrieve: function(callback) {
			var path = self._basePath() + '/account/retrieve';
			return self._execute('get', path, {}, callback);
		},

		delete: function(callback) {
			var path = self._basePath() + '/account/delete/data';

			return self._execute('del', path, {}, function(err, res) {
				if (err) {
					return callback(err);
				}
				return callback(null, res.deleted);
			});
		}
	};
	return account;
};

module.exports = account;
