var mongoose = require('mongoose');

var instanceSchema = new mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId : String,
   server_group: {
     type:String,
     default: "default"
   },
   monit_id : {
     type:String
   },
   incarnation :{
     type:Date
   },
   tags: { type: [String], index: true },
   version: String,
   server : {
     uptime : Number,
     poll : Number,
     startdelay: Number,
     localhostname : String,
     controlfile : String,
     httpd_config :{
       address: String,
       port: Number,
       ssl : Number
     },
     credentials : {
       username: String,
       password : String,
     }
   },
   platform : {
     name : String,
     release : String,
     version: String,
     machine: String,
     cpu : Number,
     memory : Number,
     swap : Number
   },
   services : [
     {
       name: String,
       type: Number,
       status : Number,
       status_hint : Number,
       monitor: Number,
       monitormode: Number,
       onreboot: Number,
       pendingaction : Number,
       extras : Object
     }
   ],
   servicegroups:[{
     name : String,
     services : [{
       name : String
     }]
   }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})


instanceSchema.query.byUserId = function(userId) {
  return this.find({ userId: userId });
};



module.exports = mongoose.model('Instance', instanceSchema);
