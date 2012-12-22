var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Command = new Schema({
  type : { type : String, required : true },
  ord  : { type : Number, required : true, unique : true, index : true },
  data : { type : Object, required : true }
});



module.exports = mongoose.model('Command', Command);