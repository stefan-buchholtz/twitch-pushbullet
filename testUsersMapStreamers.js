/* jshint esversion: 6 */

const fs = require('fs');
const async = require('async');

const MariaDB = require('mariasql');
const config = require('./config.json');

const databaseConnection = new MariaDB(config.database);
const users = require('./model/users.js')(databaseConnection);
const streamers = require('./model/streamers.js')(databaseConnection);
const usersMapStreamers = require('./model/usersMapStreamers.js')(databaseConnection);

const streamerNames = ['quickybaby', 'dexteritybonus', 'totalbiscuit', 'worldofwarcraft', 'strippin'];
const userNames = ['evilgremlin', 'grumpygrendel', 'teapot', 'smellysock'];

var streamerIds, userIds;

async.series([
	(cb) => { databaseConnection.query('DELETE FROM users_map_streamers', cb); },
	(cb) => { databaseConnection.query('DELETE FROM users', cb); },
	(cb) => { databaseConnection.query('DELETE FROM streamers', cb); },
	(cb) => { 
		async.mapSeries(streamerNames, streamers.insert, (err, result) => {
			if (err) {
				return cb(err);
			}
			streamerIds = result;
			cb();
		});
	}, 
	(cb) => { 
		async.mapSeries(userNames, (userName, cb2) => { users.insert(userName, userName, cb2); }, (err, result) => {
			if (err) {
				return cb(err);
			}
			userIds = result;
			cb(); 
		});
	}
], (err) => {
	if (err) {
		databaseConnection.end();
		console.log(err);
		return;
	}
	console.log("streamerIds:", streamerIds);
	console.log("userIds:", userIds);
	const streamers02 = streamerIds.slice(0, 3);
	const streamers25 = streamerIds.slice(2);
	async.series([
		(cb) => { usersMapStreamers.saveStreamersForUser(userIds[0], streamerIds, cb); },
		(cb) => { usersMapStreamers.saveStreamersForUser(userIds[1], streamers02, cb); },
		(cb) => { usersMapStreamers.saveStreamersForUser(userIds[1], streamers25, cb); }
	], (err) => {
		databaseConnection.end();
		if (err) {
			console.log(err);
			return;
		}
	});
});
