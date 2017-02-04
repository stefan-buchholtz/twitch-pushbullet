/* jshint esversion: 6 */

const fs = require('fs');
const async = require('async');

const MariaDB = require('mariasql');
const config = require('./config.json');

const databaseConnection = new MariaDB(config.database);
const users = require('./model/users.js')(databaseConnection);

const firstNames = fs.readFileSync('testData/firstnames.txt', 'utf8').split('\n');
const names = fs.readFileSync('testData/names.txt', 'utf8').split('\n');
const n = Math.min(names.length, firstNames.length);

var elems = [];
for (var i = 0; i < n; i++) {
	elems.push({firstName: firstNames[i], name: names[i]});
}
async.mapSeries(elems, (elem, cb) => users.insert(elem.name, elem.firstName, cb), (err, ids) => {
	databaseConnection.end();
	if (err) {
		console.log(err);
		return;
	}
	console.log(n, 'rows inserted');
});
