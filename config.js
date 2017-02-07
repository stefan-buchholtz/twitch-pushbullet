/* jshint esversion: 6 */
const environment = process.env.NODE_ENV || 'development';

var config = require('./config/' + environment + '.json');

if (process.env.DB_USER) {
	config.database.user = process.env.DB_USER;
}
if (process.env.DB_PASSWORD) {
	config.database.password = process.env.DB_PASSWORD;
}
if (process.env.TWITCH_CLIENT_SECRET) {
	config.twitch.client_secret = process.env.TWITCH_CLIENT_SECRET;
}
if (process.env.PUSHBULLET_CLIENT_SECRET) {
	config.pushbullet.client_secret = process.env.PUSHBULLET_CLIENT_SECRET;
}

const protocol = config.app.protocol || 'http';
const port = config.app.port ? ":" + config.app.port : "";
const baseUrl = protocol + "://" + config.app.host + port + config.app.basePath;
config.app.url = baseUrl;

module.exports = config;
