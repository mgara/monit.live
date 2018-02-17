const IntanceModel = require('../model/instance')
let logger = require('../logger');

function clean(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key][0]) {
        obj.key = obj[key][0];
      }
      console.log(key + " -> " + obj[key]);
    }
  }
}

function Instance(params) {
  if (params)
    this.instanceId = params.monitId
}

Instance.prototype.addOrUpdate = function (params) {

  IntanceModel.findOneAndUpdate({ monit_id: params.monit_id }, instance, (err, user) => {
    if (err) {
      return res
        .status(500)
        .send({ error: "unsuccessful" })
    };
    res.send({ success: "success" });
  });
}


Instance.sanitize = function (raw) {
  let _this = this;
  let monit = raw.monit;
  // logger.silly(JSON.stringify(monit, null, 2))
  for (var key in monit) {
    if (monit.hasOwnProperty(key)) {
      if (monit[key][0]) {
        logger.warn("is an array ...")
        monit[key] = monit[key][0];
      }
      logger.debug(JSON.stringify(monit[key], null, 2))
    }
  }
}

module.exports = Instance
