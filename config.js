/* jshint esversion: 6 */

const environment = process.env.NODE_ENV || 'development';
const config = require('./config/' + environment + '.json');

const protocol = config.app.protocol || 'http';
const port = config.app.port ? ":" + config.app.port : "";
const baseUrl = protocol + "://" + config.app.host + port + config.app.basePath;
config.app.url = baseUrl;

module.exports = config;
