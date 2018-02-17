var logger = require('./logger');
var mongoose = require('mongoose');
var nconf = require('nconf');



// Read configuration
var db_uri = nconf.get('database:uri')

// Initialize options
var options = {
    poolSize: 5
  }
  
// Attempting to connect
mongoose.connect(db_uri, options);

mongoose.connection.on('connected', function() {
    logger.info('Mongodb connection open to [' + db_uri + ']');
    logger.debug('Mongodb options: ' + JSON.stringify(options))
});

mongoose.connection.on('error', function(err) {
    logger.error('Mongodb Failed to connect to [' + db_uri + ']');
    logger.error('Mongodb error [' + err + ']');
});

mongoose.connection.on('disconnected', function() {
    logger.fatal('Mongodb disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        logger.debug('Mongodb connection disconnected through app termination');
        process.exit(0);
    });
});
