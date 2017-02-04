/* jshint esversion: 6 */
const promisify = require('es6-promisify');

const singleRowCallback = function(error, rows, callback) {
	if (error) {
		return callback(error);
	}
	if (rows.length === 0) {
		callback(null, null);
	} else {
		callback(null, rows[0]);
	}
};
module.exports.singleRowCallback = singleRowCallback;

module.exports.getSingleRowCallback = function(callback) {
	return (error, rows) => singleRowCallback(error, rows, callback);
};

module.exports.promisifyQuery = function(databaseConnection) {
	databaseConnection.pQuery = promisify(databseConnection.query);
};

module.exports.callbackOnce = function(callback, thisArg) {
	var cbCalled = false;
	var storedReturnValue;
	return function() {
		if (cbCalled) {
			return storedReturnValue;
		}
		cbCalled = true;
		storedReturnValue = callback.apply(thisArg || this, arguments);
		return storedReturnValue;
	};
};
