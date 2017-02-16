/* jshint esversion: 6 */

const config = require('../config.js');

const winston = require('winston');
const logRotate = require('winston-logrotate');
const logRotateTransport = new logRotate.Rotate(config.logging.rotate);

const logger = new (winston.Logger)({
	level: config.logging.level,
	transports: [logRotateTransport] 
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
