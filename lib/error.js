/*global module: true */

var WebpayJsError = function WebpayJsError(message) {
	Error.apply(this, arguments);
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = message;
};

WebpayJsError.prototype = new Error();
WebpayJsError.prototype.constructor = WebpayJsError;

module.exports = WebpayJsError;
