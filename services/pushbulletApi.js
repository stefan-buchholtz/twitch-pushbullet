/* jshint esversion: 6 */

const https = require('https');
const getRawBody = require('raw-body');
const config = require('../config.json');

function getRequestHeaders(oauthToken) {
	const headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	};
	if (oauthToken) {
		headers['Access-Token'] = oauthToken;
	}
	return headers;
}

function postJSON(requestOptions, postData, callback) {
	const body = JSON.stringify(postData);
	requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
	requestOptions.method = 'POST';
	const request = https.request(requestOptions, (response) => {
		if (response.statusCode !== 200) {
			const err = new Error(response.statusMessage);
			err.code = response.statusCode;
			return callback(err);
		}
		getRawBody(response, { encoding: 'utf8' }, (err, bodyText) => {
			if (err) {
				return callback(err);
			}
			callback(null, JSON.parse(bodyText));
		});		
	});
	request.on('error', callback);
	request.write(body);
	request.end();
}


module.exports.pushLink = function(oauthToken, link, title, callback) {
	const requestOptions = {
		hostname: config.pushbullet.hostname,
		path: '/v2/pushes',
		headers: getRequestHeaders(oauthToken)
	};
	const postData = {
		url: link,
		title: title,
		type: 'link'
	};
	postJSON(requestOptions, postData, callback);
};
