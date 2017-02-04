/* jshint esversion: 6 */

const https = require('https');
const getRawBody = require('raw-body');
const config = require('../config.json');

function getRequestHeaders(oauthToken) {
	const headers = {
		'Accept': 'application/vnd.twitchtv.v5+json',
		'Client-ID': config.twitch.client_id
	};
	if (oauthToken) {
		headers.Authorization = 'OAuth ' + oauthToken;
	}
	return headers;
}

function getJSON(requestOptions, callback) {
	https.get(requestOptions, (response) => {
		if (response.statusCode !== 200) {
			const err = new Error(response.statusMessage);
			err.code = response.statusCode;
			return callback(err);
		}
		getRawBody(response, { encoding: 'utf8' }, (err, bodyText) => {
			if (err) {
				return callback(err);
			}
			callback(null, JSON.parse(bodyText));
		});		
	}).on('error', callback);	
}

module.exports.getUser = function(oauthToken, callback) {
	const requestOptions = {
		hostname: config.twitch.hostname,
		path: '/kraken/user',
		headers: getRequestHeaders(oauthToken)
	};
	getJSON(requestOptions, callback);
};

module.exports.getFollowedChannels = function(twitchUserId, callback) {
	const requestOptions = {
		hostname: config.twitch.hostname,
		path: '/kraken/users/' + twitchUserId + '/follows/channels?limit=100',
		headers: getRequestHeaders()
	};
	getJSON(requestOptions, (error, result) => {
		if (error) {
			return callback(error);
		}
		callback(null, result.follows);
	});
};

module.exports.getLiveChannels = function(streamers, callback) {
	const channelIds = streamers.map(streamer => streamer.channel_id);
	const requestOptions = {
		hostname: config.twitch.hostname,
		path: '/kraken/streams?limit=100&channel=' + channelIds.join(','),
		headers: getRequestHeaders()
	};
	getJSON(requestOptions, (error, result) => {
		if (error) {
			return callback(error);
		}
		callback(null, result.streams);
	});
};
