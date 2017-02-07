/* jshint esversion: 6 */

const flash = require('../util/flash.js');
const express = require('express');
const router = express.Router();

const config = require('../config.js');

var oauth;

/* GET home page. */
router.get(config.app.basePath + '/pushbulletAuth', function(req, res, next) {
	const params = { 
		title: 'Step 2: Pushbullet Authorization',
		authUrl: oauth.getAuthenticationUrl(req.session.stateToken),
		app: config.app
	};
	if (flash.exists(req)) {
		params.flash = flash.get(req);
	}
	res.render('pushbulletAuth', params);		
});

module.exports = router;

module.exports.setOAuthClient = function(value) {
	oauth = value;
};
