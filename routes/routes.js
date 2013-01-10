var Canvas = require('../models/canvas.js')
  , fs = require('fs')
  , path = require('path')
  , rmrf = require('/usr/local/lib/node_modules/rimraf');

exports.index = function(req, res) {
  console.log('Index');
  res.redirect('/' + Canvas.max());
};

exports.new = function(req, res) {
  res.render('new', { title: 'Projekt MWT' });
};

exports.create = function(req, res) {
  var new_canvas = {
    id : Math.floor(Math.random() * Canvas.max()),
    name : req.body.canvas_name,
    width : req.body.canvas_width,
    height: req.body.canvas_height
  };
  
  var doc = new Canvas(new_canvas);

  doc.save(function(err,data) {
    if (err) {
       res.send(err);
    } else {
       console.log(data);
       res.render('canvas', {title: doc.name, canvas: doc.toObject(),
                             picName: Canvas.picName()});
    }
  });
};

exports.save = function (img_dir) {
  return function(req, res) {
    var id = req.body.id;
    var imageBuffer = new Buffer(req.body.imageData, 'base64');
    Canvas.findOne({ id: id }, function (err, doc) {
      if(!err && doc) {
        if(doc.path  && fs.existsSync(path.join(img_dir, doc.path))) {
          fs.writeFile(path.join(img_dir, doc.path, Canvas.picName()), 
           imageBuffer, function (err) {
            if(err) {
              console.log('Error occured while saving a file at ' + doc.path + 
               '.');
              res.send(err);
            } else {
              console.log('File saved at ' + doc.path + '.');
              res.send(200);
            }
          });
        } else {
          if(!fs.existsSync(path.join(img_dir, id))) {
            fs.mkdirSync(path.join(img_dir, id), function (err) {
              if(err) {
                console.log('Error: cannot create directory.');
                res.send(err);
              }
            });
          }
          fs.writeFile(path.join(img_dir, id, Canvas.picName()), 
           imageBuffer, function (err) {
            if(err) {
              console.log('Error occured while saving a file at ' + '/' + id
               + '.');
              res.send(err);
            } else {
              console.log('File saved at ' + '/' + id + '.');
              doc.path = '/' + id;
              doc.save(function (err) {
                if(err) {
                  console.log(err);
                  res.send(err);
                }
              });
              res.send(200);
            }
          });
        }
      } else {
        console.log('Error: database error occured (probably there is no ' +
          id + ' in database.');
        res.send('Error: database error occured (probably there is no ' +
          id + ' in database.');
      }
    });
  };
};

exports.gallery = function (req, res) {
  console.log('Gallery');
  Canvas.find({}, function(err, docs) {
    if(!err) {
      res.render('gallery', { title: 'Gallery', gallery: docs,
                              picName: Canvas.picName()});
    } else {
      console.log(err);
      res.send(err);
    }
  }); 
};

exports.show = function (req, res) {
  console.log('Showing ' + req.params.id);
  Canvas.findOne({ id: req.params.id}, function(err, doc) {
    if(!err && doc) {
      res.render('canvas', {title: doc.name, canvas: doc.toObject(),
                            picName: Canvas.picName()});
    } else {
      console.log(err);
      res.send(err);
    }
  }); 
};

exports.remove = function (img_dir) {
  return function (req, res) {
    console.log('Removing ' + req.params.id);

    Canvas.findOne({ id: req.params.id }, function (err, doc) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        var temp_path = doc.path;
        doc.remove( function(err) {
          if(err) {
            console.log(err);
            res.send(err);
          } else {
            console.log('Removed ' + req.params.id + ' from database.');
            if(temp_path) {
              rmrf(path.join(img_dir, temp_path), function (err) {
                if(err) {
                  console.log(err);
                  res.send(err);
                } else {
                  console.log('Removed ' + req.params.id + ' from filesystem.');
                }
              });
            }
            res.send(200);
          }
        });
      }     
    });
  }
};

exports.command = function (req, res) {
  Canvas.findOne({id: req.params.id}, 'history', function (err, doc) {
    if(!err) {
      doc.history.arr[doc.history.pos] = req.body;
      doc.history.arr.length = ++(doc.history.pos);
      doc.markModified('history.arr')
      doc.save();
      res.send(200);
    } else {
      console.log(err);
      res.send(err);
    }
  }); 
};
exports.history = function (req, res) {
  Canvas.findOne({ id: req.params[0]}, 'history', function(err, doc) {
    if(!err) {
      var begin = 0;
      var end = doc.history.pos;
      if(typeof req.params[1] != 'undefined') {
        var temp1 = parseInt(req.params[1]);
        begin = ((temp1 < 0)? doc.history.pos : 0) + temp1;
        if(typeof req.params[2] != 'undefined') {
          var temp2 = parseInt(req.params[2]);
          end = ((temp2 < 0)? doc.history.pos : 0) + temp2;
        }
      }
      res.json({
        arr: doc.history.arr.slice(begin, end),
        pos: doc.history.pos
      });
    } else {
      console.log(err);
      res.send(err);
    }
  })
};