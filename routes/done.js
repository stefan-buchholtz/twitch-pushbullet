/* jshint esversion: 6 */

const express = require('express');
const router = express.Router();

const config = require('../config.js');

/* GET home page. */
router.get(config.app.basePath + '/done', function(req, res) {
	const names = req.session.twitchFollows.map(follow => follow.channel.display_name );
	const params = { 
		title: 'Done',
		names: names,
		app: config.app
	};
	res.render('done', params);		
});

module.exports = router;
