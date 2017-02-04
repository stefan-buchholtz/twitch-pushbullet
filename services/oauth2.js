/* jshint esversion: 6 */

const url = require('url');
const crypto = require('crypto');
const https = require('https');
const getRawBody = require('raw-body');
const querystring = require('querystring');

var createClient = function(options) {
	const my = {};
	
	my.generateStateToken = function(callback) {
		crypto.randomBytes(8, (err, buffer) => {
			if (err) {
				return callback(err);
			}
			callback(null, buffer.toString('hex'));
		});
	};

	my.getAuthenticationUrl = function(stateToken, additionalQueryParams) {
		const authParams = {
			response_type: 'code',
			client_id: options.client_id,
			redirect_uri: options.redirect_uri,
			state: stateToken
		};
		if (additionalQueryParams) {
			Object.assign(authParams, additionalQueryParams);
		}
		const urlObject = {
			protocol: 'https:',
			hostname: options.auth_hostname || options.hostname,
			pathname: options.auth_path,
			search: querystring.stringify(authParams)
		};
		if (options.port) {
			urlObject.port = options.port;
		}
		return url.format(urlObject);
	};
	
	my.getAccessToken = function(authorizationCode, stateToken, callback) {
		const postData = {
			client_id: options.client_id,
			client_secret: options.client_secret,
			grant_type: 'authorization_code',
			redirect_uri: options.redirect_uri,
			code: authorizationCode,
			state: stateToken
		};
		var body, contentType;
		if (options.postContentType === 'json') {
			body = JSON.stringify(postData);
			contentType = 'application/json';
		} else {
			body = querystring.stringify(postData);
			contentType = 'application/x-www-form-urlencoded';
		}
		const requestOptions = {
			hostname: options.token_hostname || options.hostname,
			path: options.token_path,
			method: 'POST',
			headers: {
				'Content-Type': contentType,
				'Content-Length': Buffer.byteLength(body)
			}
		};
		const request = https.request(requestOptions, (response) => {
			if (response.statusCode !== 200) {
				const err = new Error(response.statusMessage);
				err.code = response.statusCode;
				return callback(err);
			}
			getRawBody(response, { encoding: 'utf8'}, (err, bodyText) => {
				if (err) {
					return callback(err);
				}
				const bodyData = JSON.parse(bodyText);
				callback(null, bodyData.access_token);
			});
		});
		request.on('error', callback);
		request.write(body);
		request.end();
	};

	return my;
};
module.exports = createClient;