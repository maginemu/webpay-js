/*global module: true */

var account = function(client) {

	var account = {

		retrieve: function(callback) {
			var path = client._basePath() + '/account/retrieve';
			return client._execute('get', path, {}, callback);
		},

		delete: function(callback) {
			var path = client._basePath() + '/account/delete/data';

			return client._execute('del', path, {}, function(err, res) {
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
