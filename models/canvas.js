var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Canvas = new Schema({
  id : {type: Number, required: true, trim: true, unique: true}, 
  name : {type: String, required: true, trim: true},
  width : {type: Number, required: true, default: 800},
  height : {type: Number, required: true, default: 600},
  history : { 
    arr: { type: Array, default: [] },
    pos: { type: Number, default: 0 } 
  },
  path: String
});

Canvas.statics.max = function () {
  return 1000000;
};

Canvas.statics.picName = function () {
  return 'pic.png';
};

Canvas.methods.push = function (command) {
  this.history.arr[this.history.pos++] = command;
  this.save(function (err) {
    if(err) {
      console.log(err);
      res.send(err);
    }
  });
};

module.exports = mongoose.model('Canvas', Canvas);
