/* jshint esversion: 6 */

const flash = require('../util/flash.js');
const express = require('express');
const router = express.Router();

var oauth;

/* GET home page. */
router.get('/pushbulletAuth', function(req, res, next) {
	const params = { 
		title: 'Step 2: Pushbullet Authorization',
		authUrl: oauth.getAuthenticationUrl(req.session.stateToken)
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
