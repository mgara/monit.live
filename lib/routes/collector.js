let logger = require('../logger');

let parseString = require('xml2js').parseString;

let InstanceController = require('../controllers/instance')

let routes = {
  collect: function (req, res, next) {

    parseString(req.body, {
      trim: true,
      normalizeTags: true,
      normalize: true,

    }, function (err, Obj) {
      InstanceController.sanitize(Obj, function (err, result) {
        if (err)
          return res.send(500)
        return res.send(200, "OK")
      })

    });

  }
}

module.exports = routes
