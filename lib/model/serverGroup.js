var mongoose = require('mongoose');

var ServerGroupSchema = new mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   userId : String,
   label : String,
   description : String
 },{
   timestamps: {
       createdAt: 'created_at',
       updatedAt: 'updated_at'
   }
 })


 module.exports = mongoose.model('ServerGroup', ServerGroupSchema);
