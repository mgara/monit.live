const restify = require('restify');
const jwt = require('restify-jwt');
const versioning = require('restify-url-semver');
const corsMiddleware = require('restify-cors-middleware')

var logger = require('./logger')
var Collector = require('./routes/collector');

// config
var nconf = require('nconf');
var secret = nconf.get("jwtcheck:secret")
var audience = nconf.get("jwtcheck:audience")

if (process.env.NODE_ENV !== "dev") {
  // Sentry Config
  var Raven = require('raven');
  var RAVEN_DSN = nconf.get("sentry:dsn");
  Raven.config(RAVEN_DSN, {
    environment: process.env.NODE_ENV
  }).install();
}


// JWTCheck Config
var jwtCheck = jwt({
  secret: secret,
  audience: audience

}).unless({
  path: ['/api/v1/yt/code', '/api/v1/twitch/code', '/api/v1/twitter/code', '/api/v1/', '/api/v1/chargebee', '/api/v1/health', '/api/v1/user/new', '/api/v1/dailymotioncb', '/api/v1/user/password-reminder', '/api/v1/user/change-password']
});

function serverLogs(method, url, statusCode) {
  if (method == "OPTIONS")
    return
  if (statusCode > 400) {
    logger.error(method + "  " + url + " " + statusCode)
    return
  }
  if (statusCode >= 300 && statusCode < 400) {
    logger.debug(method + "  " + url + " " + statusCode)
    return
  }
  if (statusCode >= 200 && statusCode < 300) {
    logger.data(method + "  " + url + " " + statusCode)
    return
  }
  logger.debug(method + "  " + url + " " + statusCode)
}

function createServer() {

  var packageJson = require('../package.json')
  var server = restify.createServer({
    name: packageJson.name,
    version: packageJson.version,
    formatters: {
      'application/hal+json': function (req, res, body, cb) {
        return res.formatters['application/json'](req, res, body, cb)
      }
    }
  })


  function sendErrorToSentry(level) {
    return function (req, res, err) {
      if (process.env.NODE_ENV !== "dev") {

        Raven.captureException(err, {
          level: level
        })
      } else {
        if (level == "warning") {
          logger.warn(JSON.stringify(err))
        } else {
          logger.error(JSON.stringify(err))
        }
      }
      return res.send(err)
    }
  }

  server.on('uncaughtException', (req, res, route, err) => {
    if (process.env.NODE_ENV !== "dev") {
      Raven.captureException(err)
    } else {
      try {
        logger.error(JSON.stringify(err))
      } catch (e) {

      }
    }
  })
  server.on('InternalServer', sendErrorToSentry('error'))
  server.on('NotFound', sendErrorToSentry('warning'))
  server.on('MethodNotAllowed', sendErrorToSentry('warning'))
  server.on('VersionNotAllowed', sendErrorToSentry('error'))
  server.on('UnsupportedMediaType', sendErrorToSentry('error'))
  server.on('after', (req, res, route, err) => {
    if (err) Raven.captureException(err)
  })

  const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['API-Token', 'authorization'],
    exposeHeaders: ['API-Token-Expiry']
  })

  server.pre(cors.preflight)
  server.use(cors.actual)

  server.use(
    function crossOrigin(req, res, next) {
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return next();
    }
  );

  //  server.use(jwtCheck)

  server.use(restify.plugins.authorizationParser());
  server.use(restify.plugins.queryParser({
    mapParams: false
  }));
  server.use(restify.plugins.bodyParser());

  // Add restify-url-semver middleware
  server.pre(
    versioning({
      prefix: '/api'
    })
  );

  server.on('after', function (request, response, route, error) {
    serverLogs(request.method, request.url.substring(1), response.statusCode)
  });

  server.get({
    path: '/'
  }, function root(req, res, next) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end('Welcome to Monit.Live API');
  });

  server.post({
    path: '/collect'
  }, Collector.collect);

  return server;
}


module.exports = {
  createServer: createServer
};
