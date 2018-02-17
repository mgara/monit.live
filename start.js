if (process.env.NODE_ENV == undefined) {
    console.log("NODE_ENV not set, please export the env variable : dev , production, test")
    process.exit(1)
}
if (process.env.NODE_ENV == "dev") {
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED == undefined) {
        console.log("NODE_TLS_REJECT_UNAUTHORIZED is not set, export NODE_TLS_REJECT_UNAUTHORIZED=0")
        process.exit(1)
    }
}

// NConf: Read configuration
var nconf = require('nconf');
nconf.argv()
    .env()
    .file({ file: 'config/' + process.env.NODE_ENV + '.json' });

var logger = require('./lib/logger');

//Bluebird
const Promise = require('bluebird');
Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true,
    monitoring: true
});

//MongoDB + Mongoose : Setup the Database
var mongodb = require('./lib/mongodb');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

//Cluster
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var env = process.env.NODE_ENV;

if (env == "dev" || env == "test") {
    numCPUs = 1
}


//Others
var server = require( './lib/server');
var server_port = nconf.get('server_port');

if (cluster.isMaster) {
    // Fork workers. One per CPU for maximum effectiveness
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(deadWorker, code, signal) {
        // Restart the worker
        var worker = cluster.fork();

        // Note the process IDs
        var newPID = worker.process.pid;
        var oldPID = deadWorker.process.pid;

        // Log the event
        logger.warn('Worker died [' + oldPID + '] New ['+newPID+']');

    });
} else {
    (function() {
        var s = server.createServer();

        s.listen(server_port, "0.0.0.0", function() {
            logger.info('Http server listening on ' + server_port);
        });
    })();
}
