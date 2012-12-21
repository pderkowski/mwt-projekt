
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , Canvas = require('./models/canvas')
  , app = express();
  

mongoose.connect('mongodb://127.0.0.1/CanvasDB');
 
mongoose.connection.on('open', function() {
  console.log('Connected to Mongoose');
  Canvas.findOne({id: 1000000}, function (err, doc) {
    if(err || !doc) {
      var default_canvas = new Canvas({
        id : 1000000,
        name : 'default',
        width : 800,
        height: 600
      });
      default_canvas.save(function(err,data) {
        if (err) {
           console.log(err);
        } else {
           console.log(data);
        }
      });
    }
    else {
      console.log(doc);
    }
  });
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('images', path.join(__dirname, 'public', 'images'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public', 'images')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/new', routes.new);
app.get('/gallery', routes.gallery);
app.get('/:id', routes.show);
app.post('/create', routes.create);
app.post('/save', routes.save(app.get('images')) );
app.post('/delete/:id', routes.remove(app.get('images')) );

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});