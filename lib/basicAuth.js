var restify = require('restify');

var basicAuth = function(params){
  return function(req, res, next) {
      res.header('WWW-Authenticate', 'Basic realm="Livescale Chargebee WebHooks"');
      if (!req.authorization ||
          !req.authorization.basic ||
          !req.authorization.basic.password
      ) {
          res.send(401);
          return next(new restify.NotAuthorizedError());
      }

      var password = req.authorization.basic.password
      var username = req.authorization.basic.username

      if (password != params.password || username != params.username) {
          res.send(401);
          return next(new restify.NotAuthorizedError());
      } else {
          return next();
      }
  };
}

module.exports = basicAuth
