/* jshint esversion: 6 */

const MariaDB = require('mariasql');
const config = require('./config.json');

const databaseConnection = new MariaDB(config.database);
const streamers = require('./model/streamers.js')(databaseConnection);
const users = require('./model/users.js')(databaseConnection);
const usersMapStreamers = require('./model/usersMapStreamers.js')(databaseConnection);

const twitchPushbulletService = require('./services/twitchPushbulletService.js');
twitchPushbulletService.setUserDAO(users);
twitchPushbulletService.setStreamerDAO(streamers);
twitchPushbulletService.setUserMapStreamerDAO(usersMapStreamers);

twitchPushbulletService.updateAllUserChannelFollows((err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('success!');
	}
	databaseConnection.close();
});
