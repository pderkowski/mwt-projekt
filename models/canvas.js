var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Canvas = new Schema({
  id : {type: Number, required: true, trim: true, unique: true}, 
  name : {type: String, required: true, trim: true},
  width : {type: Number, required: true, default: 800},
  height : {type: Number, required: true, default: 600},
  path: String
});

Canvas.statics.max = function () {
  return 1000000;
};

Canvas.statics.picName = function () {
  return 'pic.png';
};

module.exports = mongoose.model('Canvas', Canvas);
