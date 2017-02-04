/* jshint esversion: 6 */

const MariasqlPool = require('./mariasql_pool.js');
const config = require('../config.js');

module.exports = new MariasqlPool(config.database.maxPool, config.database);
