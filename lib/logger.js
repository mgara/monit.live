/*jslint node: true */
"use strict";

// nconf
var nconf = require('nconf');

// winston imports
var winston = require('winston');
require('winston-daily-rotate-file');
var Sentry = require('winston-sentry');

// utility class


var pjson = require('../package.json');

var LOGGING_LEVEL = nconf.get("log_level") || "silly";
var config = {
    levels: {
        data: 6,
        debug: 5,
        info: 4,
        warn: 3,
        error: 2,
        fatal: 1,
        silly: 0
    },
    colors: {
        data: 'grey',
        debug: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'magenta',
        silly: 'cyan'
    }
};


var rotate_file_transport = new winston.transports.DailyRotateFile({
    filename: '/var/log/' + pjson.name + '.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    timestamp: true,
    zippedArchive : true,
    json:false,
    formatter: function(data) {
        return new Date().toISOString() + ' ' + data.level.toUpperCase() + '\t' + (data.message ? data.message : '') +
            (data.meta && Object.keys(data.meta).length ? '\n\t' + JSON.stringify(data.meta) : '');
    },
    level: LOGGING_LEVEL
});

var logger = module.exports = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            colorize: 'all',
            timestamp: true,
            level: LOGGING_LEVEL
        }),
        rotate_file_transport,
        new Sentry({
            level: 'error',
            dsn: nconf.get("sentry:dsn"),
            tags: {
                environment: process.env.NODE_ENV
            }
        })
    ],
    levels: config.levels,
    colors: config.colors
});

if(process.env.NODE_ENV=== "dev"){
    logger.remove(Sentry);
    logger.silly("Removed Sentry Logger for dev environment")
}

if (LOGGING_LEVEL === "off") { // reports only to Sentry
    logger.remove(winston.transports.Console);
    logger.remove(winston.transports.DailyRotateFile);
} else {
    if (LOGGING_LEVEL !== "data") {
        logger.remove(winston.transports.DailyRotateFile);
    }
    logger.silly("Started Logger with [" + LOGGING_LEVEL + "]")
}
