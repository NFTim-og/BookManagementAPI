const morgan = require('morgan');
const logger = require('../utils/logger');

const loggerMiddleware = morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
});

module.exports = loggerMiddleware;