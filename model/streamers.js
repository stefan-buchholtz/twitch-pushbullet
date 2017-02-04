/* jshint esversion: 6 */
const database = require('../util/database.js');
const databaseUtils = require('../util/databaseUtils.js');

const SELECT = "SELECT id, name, display_name, channel_id FROM streamers";
const WHERE_ID = " WHERE id = ?";
const WHERE_NAME = " WHERE name = ?";
const WHERE_CHANNEL_ID = " WHERE channel_id = ?";
const ORDER_BY_NAME = " ORDER BY name";
const UPDATE = "UPDATE streamers SET name = ?, display_name = ?, channel_id = ? WHERE id = ?";
const INSERT = "INSERT INTO streamers (name, display_name, channel_id, creation_date) VALUES (?, ?, ?, ?)";
const CLEANUP = "DELETE FROM streamers WHERE id NOT IN (SELECT DISTINCT streamer_id FROM users_map_streamers)";

module.exports.getAll = function(callback) {
	database.query(SELECT + ORDER_BY_NAME, databaseUtils.callbackOnce(callback));
};

module.exports.get = function(id, callback) {
	database.query(SELECT + WHERE_ID, [id], databaseUtils.getSingleRowCallback(databaseUtils.callbackOnce(callback)));
};

const getByName = function(name, callback) {
	database.query(SELECT + WHERE_NAME, [name], databaseUtils.getSingleRowCallback(databaseUtils.callbackOnce(callback)));
};
module.exports.getByName = getByName;

const getByChannelId = function(channelId, callback) {
	database.query(SELECT + WHERE_CHANNEL_ID, [channelId], databaseUtils.getSingleRowCallback(databaseUtils.callbackOnce(callback)));
};
module.exports.getByChannelId = getByChannelId;

const update = function(streamer, callback) {
	database.query(UPDATE, [streamer.name, streamer.display_name || streamer.name, streamer.channel_id, streamer.id], databaseUtils.callbackOnce(callback));
};
module.exports.update = update;

const insert = function(streamer, callback) {
	var cbCalled = false;
	database.query(INSERT, [streamer.name, streamer.display_name || streamer.name, streamer.channel_id, new Date().toISOString()], (err) => {
		if (cbCalled) {
			return;
		}
		cbCalled = true;
		if (err) {
			return callback(err);
		}
		streamer.id = parseInt(database.lastInsertId());
		callback(null, streamer);
	});
};
module.exports.insert = insert;

module.exports.insertIfNotExists = function(streamer, callback) {
	getByChannelId(streamer.channel_id, (error, existingStreamer) => {
		if (error) {
			return callback(error);
		}
		if (existingStreamer) {
			if (existingStreamer.name !== streamer.name || existingStreamer.display_name !== streamer.display_name) {
				existingStreamer.name = streamer.name;
				existingStreamer.display_name = streamer.display_name;
				update(existingStreamer, (err) => {
					if (err) {
						return callback(err);
					}
					callback(null, existingStreamer);
				});
			} else {
				callback(null, existingStreamer);
			}
		} else {
			insert(streamer, callback);
		}
	});
};

module.exports.cleanup = function(callback) {
	database.query(CLEANUP, databaseUtils.callbackOnce(callback));
};
