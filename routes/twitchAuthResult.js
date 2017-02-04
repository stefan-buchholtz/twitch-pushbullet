/* jshint esversion: 6 */

const flash = require('../util/flash.js');
const twitchApi = require('../services/twitchApi.js');
const express = require('express');
const router = express.Router();

var oauth;

/* GET home page. */
router.get('/twitchAuthResult', function(req, res, next) {
	const state = req.query.state;
	if (req.session.stateToken !== state) {
		console.log('state token not valid', req.session.stateToken, state);
		flash.set(req, 'Possible hacking attempt - twitch authentication failed.');
		res.redirect('/');
		return;
	}
	const authCode = req.query.code;
	oauth.getAccessToken(authCode, state, (err, accessToken) => {
		if (err) {
			console.log('access token fetch failed', err);
			flash.set(req, err.message);
			res.redirect('/');
			return;
		}
		twitchApi.getUser(accessToken, (err, user) => {
			if (err) {
				console.log('get user info failed', err);
				flash.set(req, err.message);
				res.redirect('/');
				return;
			}
			req.session.user = {
				email: user.email,
				twitch_user_id: user._id,
				twitch_name: user.name,
				twitch_token: accessToken
			};
			twitchApi.getFollowedChannels(user._id, (err, follows) => {
				if (err) {
					console.log('get followed channels failed', err);
					flash.set(req, err.message);
					res.redirect('/');
					return;
				}
				req.session.twitchFollows = follows;
				res.redirect('/pushbulletAuth');
			});
		});
	});
});

module.exports = router;

module.exports.setOAuthClient = function(value) {
	oauth = value;
};
