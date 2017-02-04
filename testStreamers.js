/* jshint esversion: 6 */

const fs = require('fs');
const async = require('async');

const MariaDB = require('mariasql');
const config = require('./config.json');

const databaseConnection = new MariaDB(config.database);
const streamers = require('./model/streamers.js')(databaseConnection);

streamers.cleanup(function() {
	fs.readFile('testData/names.txt', 'utf8', function(err, data) {
		const names = data.split('\n');
		async.mapSeries(names, streamers.insert, (err, ids) => {
			databaseConnection.end();
			if (err) {
				console.log(err);
				return;
			}
			console.log(ids);
			console.log(names.length, 'rows inserted');
		});
	});
});
