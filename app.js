/* jshint esversion: 6 */

const oauth2 = require('./services/oauth2.js');
const config = require('./config.js');

const twitchPushbulletService = require('./services/twitchPushbulletService.js');

const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'iridium-next-1',
	name: 'twitch-pushbullet.sid',
	cookie: {
		secure: false,
		sameSite: 'lax'
	}
}));

const twitchOAuth2 = oauth2({
	hostname: 'api.twitch.tv',
	auth_path: '/kraken/oauth2/authorize',
	token_path: '/kraken/oauth2/token',
	redirect_uri: config.app.url + '/twitchAuthResult',
	client_id: config.twitch.client_id,
	client_secret: config.twitch.client_secret
});
const twitchAuth = require('./routes/twitchAuth.js');
twitchAuth.setOAuthClient(twitchOAuth2);
app.use(twitchAuth);

const twitchAuthResult = require('./routes/twitchAuthResult.js');
twitchAuthResult.setOAuthClient(twitchOAuth2);
app.use(twitchAuthResult);

const pushbulletOAuth2 = oauth2({
	auth_hostname: 'www.pushbullet.com',
	token_hostname: 'api.pushbullet.com',
	auth_path: '/authorize',
	token_path: '/oauth2/token',
	postContentType: 'json',
	redirect_uri: config.app.url + '/pushbulletAuthResult',
	client_id: config.pushbullet.client_id,
	client_secret: config.pushbullet.client_secret
});
const pushbulletAuth = require('./routes/pushbulletAuth.js');
pushbulletAuth.setOAuthClient(pushbulletOAuth2);
app.use(pushbulletAuth);

const pushbulletAuthResult = require('./routes/pushbulletAuthResult.js');
pushbulletAuthResult.setOAuthClient(pushbulletOAuth2);
app.use(pushbulletAuthResult);

const done = require('./routes/done.js');
app.use(done);

app.get('/', function(req, res) {
	res.redirect(config.app.basePath + '/twitchAuth');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// regular tasks
twitchPushbulletService.initRegularTasks();

module.exports = app;
