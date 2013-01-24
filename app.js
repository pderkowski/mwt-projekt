var express = require('express')
  , routes = require('./routes/routes')
  , path = require('path')
  , mongoose = require('mongoose')
  , Canvas = require('./models/canvas')
  , ioHandler = require('./routes/socketServer')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
    

mongoose.connect('mongodb://127.0.0.1/CanvasDB');
 
mongoose.connection.on('open', function() {
  console.log('Connected to Mongoose');
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
app.get(/^\/(\d+)\/history(?:\/(-?\d+)(?:\,(-?\d+))?)?$/, routes.history); // /:id/history || /:id/history/:num || /:id/history/:num1,:num2
app.post('/create', routes.create);
app.post('/save', routes.save(app.get('images')) );
app.post('/delete/:id', routes.remove(app.get('images')) );

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', ioHandler.connection);


