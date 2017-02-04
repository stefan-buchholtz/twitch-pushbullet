/* jshint esversion: 6 */
const database = require('../util/database.js');
const databaseUtils = require('../util/databaseUtils.js');

const SELECT = 'SELECT id, email, twitch_user_id, twitch_name, twitch_token, twitch_fail_count, pushbullet_token, pushbullet_fail_count FROM users u';
const JOIN_USERS_MAP_STREAMERS = ' JOIN users_map_streamers ums ON ums.user_id = u.id ';
const JOIN_STREAMERS = ' JOIN streamers s ON s.id = ums.streamer_id ';
const WHERE_ID = ' WHERE u.id = ?';
const WHERE_STREAMER_NAME = ' WHERE s.name = ?';
const WHERE_STREAMER_ID = ' WHERE ums.streamer_id = ?';
const WHERE_TWITCH_USER_ID = ' WHERE twitch_user_id = ?';
const INC_TWITCH_FAIL = 'UPDATE users SET twitch_fail_count = twitch_fail_count + 1 WHERE id = ?';
const INC_PUSHBULLET_FAIL = 'UPDATE users SET pushbullet_fail_count = pushbullet_fail_count + 1 WHERE id = ?';
const INSERT = 'INSERT INTO users (email, twitch_user_id, twitch_name, twitch_token, twitch_fail_count, pushbullet_token, pushbullet_fail_count, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
const UPDATE = 'UPDATE users SET email = ?, twitch_user_id = ?, twitch_name = ?, twitch_token = ?, twitch_fail_count = ?, pushbullet_token = ?, pushbullet_fail_count = ? WHERE id = ?';
const DELETE = 'DELETE FROM users WHERE id = ?';

module.exports.getAll = function(callback) {
	database.query(SELECT, databaseUtils.callbackOnce(callback));
};

module.exports.get = function(id, callback) {
	database.query(SELECT + WHERE_ID, [id], databaseUtils.getSingleRowCallback(databaseUtils.callbackOnce(callback)));
};

const getByTwitchUserId = function(twitch_user_id, callback) {
	database.query(SELECT + WHERE_TWITCH_USER_ID, [twitch_user_id], databaseUtils.getSingleRowCallback(databaseUtils.callbackOnce(callback)));
};
module.exports.getByTwitchUserId = getByTwitchUserId;

module.exports.getAllByStreamerId = function(streamerId, callback) {
	database.query(SELECT + JOIN_USERS_MAP_STREAMERS + WHERE_STREAMER_ID, [streamerId], databaseUtils.callbackOnce(callback));
};

module.exports.getAllByStreamerName = function(streamerName, callback) {
	database.query(SELECT + JOIN_USERS_MAP_STREAMERS + JOIN_STREAMERS + WHERE_STREAMER_NAME, [streamerName], databaseUtils.callbackOnce(callback));
};

module.exports.incrementTwitchFail = function(id, callback) {
	database.query(INC_TWITCH_FAIL, [newName, id], databaseUtils.callbackOnce(callback));
};

module.exports.incrementPushbulletFail = function(id, callback) {
	database.query(INC_PUSHBULLET_FAIL, [newName, id], databaseUtils.callbackOnce(callback));
};

const update = function(user, callback) {
	var cbCalled = false;
	database.query(UPDATE, [user.email, user.twitch_user_id, user.twitch_name, user.twitch_token, user.twitch_fail_count || 0, user.pushbullet_token, user.pushbullet_fail_count || 0, user.id], (err, result) => {
		if (cbCalled) {
			return;
		}
		cbCalled = true;
		if (err) {
			return callback(err);
		}
		callback(null, result.info.affectedRows);
	});		
};
module.exports.update = update;

const insert = function(user, callback) {
	var cbCalled = false;
	database.query(INSERT, [user.email, user.twitch_user_id, user.twitch_name, user.twitch_token, user.twitch_fail_count || 0, user.pushbullet_token, user.pushbullet_fail_count || 0, new Date().toISOString()], (err) => {
		if (cbCalled) {
			return;
		}
		cbCalled = true;
		if (err) {
			return callback(err);
		}
		user.id = parseInt(database.lastInsertId());
		callback(null, user);
	});
};
module.exports.insert = insert;

module.exports.write = function(user, callback) {
	getByTwitchUserId(user.twitch_user_id, (err, oldUser) => {
		if (err) {
			return callback(err);
		}
		if (oldUser) {
			user.id = oldUser.id;
			user.twitch_fail_count = user.twitch_fail_count || oldUser.twitch_fail_count;
			user.pushbullet_fail_count = user.pushbullet_fail_count || oldUser.pushbullet_fail_count;
			update(user, (err) => {
				if (err) {
					return callback(err);
				}
				callback(null, user);
			});
		} else {
			insert(user, callback);
		}
	});
};

module.exports.delete = function(id, callback) {
	database.query(DELETE, [id], databaseUtils.callbackOnce(callback));
};
