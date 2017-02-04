/* jshint esversion: 6 */

module.exports.set = function(req, flash) {
	req.session.flash = flash;
};

module.exports.exists = function(req) {
	return req.session.flash !== undefined && req.session.flash !== null;
};

module.exports.get = function(req) {
	if (req.session.flash) {
		const flash = req.session.flash;
		req.session.flash = undefined;
		return flash;
	} else {
		return null;
	}
};
