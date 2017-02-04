/* jshint esversion: 6 */

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/done', function(req, res) {
	const names = req.session.twitchFollows.map(follow => follow.channel.display_name );
	const params = { 
		title: 'Done',
		names: names
	};
	res.render('done', params);		
});

module.exports = router;
