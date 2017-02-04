/* jshint esversion: 6 */

const flash = require('../util/flash.js');

const express = require('express');
const router = express.Router();

const SCOPES 		= 'user_read';

var oauth;

/* GET home page. */
router.get('/twitchAuth', function(req, res, next) {
	oauth.generateStateToken(function(err, stateToken) {
		req.session.stateToken = stateToken;
		const twitchAuthUrl = oauth.getAuthenticationUrl(stateToken, { scope: SCOPES });
		const params = { 
			title: 'Step 1: Twitch Authorization', 
			authUrl: twitchAuthUrl
		};
		if (flash.exists(req)) {
			params.flash = flash.get(req);
		}
		res.render('twitchAuth', params);
	});
});

module.exports = router;

module.exports.setOAuthClient = function(value) {
	oauth = value;
};
