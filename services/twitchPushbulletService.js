/* jshint esversion: 6 */

const async = require('async');

require('../util/setExtension.js');
const twitchApi = require('./twitchApi.js');
const pushbulletApi = require('./pushbulletApi.js');
const config = require('../config.json');

const userDAO = require('../model/users.js');
const streamerDAO = require('../model/streamers.js');
const userMapStreamerDAO = require('../model/usersMapStreamers.js');

const currentLiveStreamers = new Map();

const writeChannelFollows = function(user, follows, callback) {
	const streamers = follows.map(follow => { 
		return {
			name: follow.channel.name,
			display_name: follow.channel.display_name,
			channel_id: follow.channel._id 
		};
	});
	async.mapSeries(streamers, streamerDAO.insertIfNotExists, (err, streamers) => {
		if (err) {
			return callback(err);
		}
		userMapStreamerDAO.saveStreamersForUser(user, streamers, callback);
	});
};
module.exports.writeChannelFollows = writeChannelFollows;

const updateUserChannelFollows = function(user, callback) {
	twitchApi.getFollowedChannels(user.twitch_user_id, (err, follows) => {
		if (err) {
			return callback(err);
		}
		writeChannelFollows(user, follows, callback);
	});
};
module.exports.updateUserChannelFollows = updateUserChannelFollows;

const updateAllUserChannelFollows = function(callback) {
	async.waterfall([
		userDAO.getAll,
		(users, callback) => {
			async.eachSeries(users, (user, callback) => {
				updateUserChannelFollows(user, (err) => {
					if (err) {
						return callback(err);
					}
					setTimeout(callback, 1000);
				});
			}, callback);
		},
		streamerDAO.cleanup
	], callback);
};
module.exports.updateAllUserChannelFollows = updateAllUserChannelFollows;

function updateCurrentLiveStreamers(liveStreamers) {
	const liveStreamerIds = liveStreamers.map(liveStreamer => liveStreamer.id);
	const currentLiveStreamerIdSet = new Set(currentLiveStreamers.keys());
	
	const offlineStreamerIdSet = currentLiveStreamerIdSet.difference(new Set(liveStreamerIds));
	offlineStreamerIdSet.forEach(id => {
		currentLiveStreamers.delete(id);
	});
	
	const wentLiveSinceLastUpdate = [];
	liveStreamers.forEach(streamer => {
		if (!currentLiveStreamers.has(streamer.id)) {
			wentLiveSinceLastUpdate.push(streamer);
		}
		currentLiveStreamers.set(streamer.id, streamer);
	});
	return wentLiveSinceLastUpdate;
}

module.exports.getCurrentLiveStreamers = function() {
	return currentLiveStreamers;
};

const updateLiveStreamers = function(callback) {
	streamerDAO.getAll((err, streamers) => {
		if (err) {
			return callback(err);
		}
		twitchApi.getLiveChannels(streamers, (err, liveStreams) => {
			if (err) {
				return callback(err);
			}
			const liveChannels = new Map(liveStreams.map(liveStream => [String(liveStream.channel._id), liveStream.channel]));
			const liveStreamers = streamers.filter(streamer => liveChannels.has(streamer.channel_id));
			const justWentLive = updateCurrentLiveStreamers(liveStreamers);
			justWentLive.forEach(streamer => {
				const channel = liveChannels.get(streamer.channel_id);
				streamer.url = channel.url;
			});
			callback(null, justWentLive);
		});
	});
};
module.exports.updateLiveStreamers = updateLiveStreamers;

function fetchFollowersForStreamers(streamers, callback) {
	async.mapSeries(streamers, (streamer, cb) => {
		userDAO.getAllByStreamerId(streamer.id, (err, users) => {
			if (err) {
				return cb(err);
			}
			cb(null, {
				streamer: streamer,
				users: users
			});
		});
	}, callback);
}

function pushStreamerLiveNotifications(streamer, users, callback) {
	const title = streamer.display_name + ' just went live.';
	async.eachSeries(users, (user, cb) => {
		pushbulletApi.pushLink(user.pushbullet_token, streamer.url, title, cb);
	}, callback);
}

function pushAllLiveNotifications(streamersWithUsers, callback) {
	async.eachSeries(streamersWithUsers, (elem, cb) => {
		pushStreamerLiveNotifications(elem.streamer, elem.users, cb);
	}, callback);
}

const pushNewLiveStreamers = function(callback) {
	async.waterfall([
		updateLiveStreamers,
		(streamersLiveSinceLastCheck, cb) => { fetchFollowersForStreamers(streamersLiveSinceLastCheck, cb); },
		(streamersWithUsers, cb) => { pushAllLiveNotifications(streamersWithUsers, cb); }
	], callback);
};
module.exports.pushNewLiveStreamers = pushNewLiveStreamers;

function makeTask(task, taskName) {
	return () => {
		console.log(taskName, 'start');
		task((err) => {
			if (err) {
				console.log(taskName, 'error:', err);
				return;
			}
			console.log(taskName, 'done');
		});
	};
}

module.exports.initRegularTasks = function() {
	console.log('start init');
	const pushNewLiveStreamersTask = makeTask(pushNewLiveStreamers, 'pushNewLiveStreamers');
	const updateAllUserChannelFollowsTask = makeTask(updateAllUserChannelFollows, 'updateAllUserChannelFollows');
	
	setInterval(pushNewLiveStreamersTask, config.updates.checkLiveInterval);
	setInterval(updateAllUserChannelFollowsTask, config.updates.updateFollowsInterval);
	
	async.series([updateAllUserChannelFollows, pushNewLiveStreamers], (err) => {
		if (err) {
			console.log('Error first update:', err);			
		}
		console.log('init done');
	});
};
