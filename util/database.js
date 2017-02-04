/* jshint esversion: 6 */

const MariasqlPool = require('./mariasql_pool.js');
const config = require('../config.json');

module.exports = new MariasqlPool(config.database.maxPool, config.database);
