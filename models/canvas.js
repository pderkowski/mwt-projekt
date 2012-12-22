var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Canvas = new Schema({
  id : {type: Number, required: true, trim: true, unique: true}, 
  name : {type: String, required: true, trim: true},
  width : {type: Number, required: true, default: 800},
  height : {type: Number, required: true, default: 600},
  history : { 
    arr: { type: Array, required: true, default: [] },
    pos: { type: Number, required: true, default: 0 } 
  },
  path: String
});

Canvas.statics.max = function () {
  return 1000000;
};

Canvas.statics.picName = function () {
  return 'pic.png';
};

Canvas.methods.push = function (commands) {
  var length = commands.length;
  for(var i = this.history.pos, j = 0; j === length; ) {
    this.history.arr[i++] = commands[j++];
  }
};

Canvas.methods.redo = function () {
  if(this.history.pos < this.history.arr.length) {
    ++pos;
  }
};

Canvas.methods.undo = function () {
  if(this.history.pos > 0) {
    --pos;
  }
}
 
module.exports = mongoose.model('Canvas', Canvas);
