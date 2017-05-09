/* jshint esversion: 6 */

const flash = require('../util/flash.js');
const twitchPushbulletService = require('../services/twitchPushbulletService.js');

const express = require('express');
const router = express.Router();

const userDAO = require('../model/users.js');
const config = require('../config.js');
const logger = require('../util/logger.js');

var oauth;

/* GET home page. */
router.get('/pushbulletAuthResult', (req, res, next) => {
	const state = req.query.state;
	if (req.session.stateToken !== state) {
		logger.warn('state token not valid: %s != %s', req.session.stateToken, state);
		flash.set(req, 'Possible hacking attempt - twitch authentication failed.');
		res.redirect(config.app.basePath + '/');
		return;
	}
	const authCode = req.query.code;
	oauth.getAccessToken(authCode, state, (err, pushbulletAccessToken) => {
		if (err) {
			logger.error('access token fetch failed', err);
			flash.set(req, err.message);
			res.redirect(config.app.basePath + '/pushbulletAuth');
			return;
		}
		req.session.user.pushbullet_token = pushbulletAccessToken;
		logger.info('user: %s', req.session.user);
		userDAO.write(req.session.user, (err, user) => {
			if (err) {
				logger.error('user write failed', err);
				flash.set(req, err.message);
				res.redirect(config.app.basePath + '/pushbulletAuth');
				return;
			}
			twitchPushbulletService.writeChannelFollows(user, req.session.twitchFollows, (err) => {
				if (err) {
					logger.error('twitch follows write failed', err);
					flash.set(req, err.message);
					res.redirect(config.app.basePath + '/pushbulletAuth');
					return;
				}
				res.redirect(config.app.basePath + '/done');
			});
		});
	});
});

module.exports = router;

module.exports.setOAuthClient = function(value) {
	oauth = value;
};
