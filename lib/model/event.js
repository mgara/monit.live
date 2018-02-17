var mongoose = require('mongoose');


var eventSchema = new mongoose.Schema({
  _id :  mongoose.Schema.Types.ObjectId,
  event_date : {
    type: Date,
    default : new Date()
  },
  node_id : String,
  service : String,
  type : Number,
  id : Number,
  state : Number,
  action : Number,
  message : String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

eventSchema.query.byEventId = function(eventId) {
  return this.find({ _id: eventId });
};

eventSchema.query.byInstanceId = function(instanceId) {
  return this.find({ node_id: instanceId });
};



module.exports = mongoose.model('MonitEvent', eventSchema);
