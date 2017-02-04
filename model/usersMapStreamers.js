/* jshint esversion: 6 */

const async = require('async');
const database = require('../util/database.js');
const databaseUtils = require('../util/databaseUtils.js');
require('../util/setExtension.js');

const SELECT_STREAMER_ID = "SELECT streamer_id FROM users_map_streamers WHERE user_id = ?";
const INSERT = "INSERT INTO users_map_streamers (user_id, streamer_id) VALUES (?, ?)";
const DELETE = "DELETE FROM users_map_streamers WHERE user_id = ? AND streamer_id = ?";

function getId(val) {
	switch (typeof val) {
	case "string":
		return parseInt(val);
	case "number":
		return val;
	default:
		return parseInt(val.id);
	}
}

const getStreamerIdsForUserId = function(userId, callback) {
	var cbCalled = false;
	database.query(SELECT_STREAMER_ID, [userId], (err, rows) => {
		if (cbCalled) {
			return;
		}
		cbCalled = true;
		if (err) {
			return callback(err);
		}
		callback(null, new Set(rows.map(row => parseInt(row.streamer_id))));
	});
};
module.exports.getStreamerIdsForUserId = getStreamerIdsForUserId;

const insertMap = function(userId, streamerId, callback) {
	database.query(INSERT, [userId, streamerId], databaseUtils.callbackOnce(callback));
};
module.exports.insert = insertMap;

const deleteMap = function(userId, streamerId, callback) {
	database.query(DELETE, [userId, streamerId], databaseUtils.callbackOnce(callback));
};
module.exports.delete = deleteMap;

module.exports.saveStreamersForUser = function(user, streamers, callback) {
	const userId = getId(user);
	const cbCalled = false;
	database.query('START TRANSACTION', (err) => {
		if (cbCalled) {
			return;
		}
		const getStreamerIds = (cb) => getStreamerIdsForUserId(userId, cb);
		const insertStreamerId = (streamerId, cb) => insertMap(userId, streamerId, cb);
		const deleteStreamerId = (streamerId, cb) => deleteMap(userId, streamerId, cb);
	
		const newStreamerIds = new Set(streamers.map(getId));
		getStreamerIdsForUserId(userId, (err, existingStreamerIds) => {
			if (err) {
				database.query('ROLLBACK', () => callback(err));
				return;
			}
			const addedStreamerIds = newStreamerIds.difference(existingStreamerIds);
			const removedStreamerIds = existingStreamerIds.difference(newStreamerIds);
			async.series([
				(cb) => async.eachSeries(addedStreamerIds, insertStreamerId, cb),
				(cb) => async.eachSeries(removedStreamerIds, deleteStreamerId, cb),
				(cb) => database.query('COMMIT', cb)
			], (err) => {
				if (err) {
					database.query('ROLLBACK', () => callback(err));
					return;
				}
				callback();
			});
		});
	});
};
