
var account = function() {
	var self = this;
	var account = {
		retrieve: function(callback) {

			var path = self.api_base + self.api_version + '/account/retrieve';


			return self._execute('get', path, {}, callback);
		}
	};
	return account;
};

module.exports = account;
