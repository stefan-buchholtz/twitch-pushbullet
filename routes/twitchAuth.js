/* jshint esversion: 6 */

const flash = require('../util/flash.js');

const express = require('express');
const router = express.Router();

const config = require('../config.js');

const SCOPES = 'user_read';

var oauth;

/* GET home page. */
router.get(config.app.basePath + '/twitchAuth', function(req, res, next) {
	oauth.generateStateToken(function(err, stateToken) {
		req.session.stateToken = stateToken;
		const twitchAuthUrl = oauth.getAuthenticationUrl(stateToken, { scope: SCOPES });
		const params = { 
			title: 'Step 1: Twitch Authorization', 
			authUrl: twitchAuthUrl,
			app: config.app
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
