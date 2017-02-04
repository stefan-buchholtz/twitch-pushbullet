/* jshint esversion: 6 */

const environment = process.env.NODE_ENV || 'development';
const config = require('./config/' + environment + '.json');

module.exports = config;
