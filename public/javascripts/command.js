//client
var canvasClient = function () {
  var that = this;
  this.command = function (name, data, drawingCtxt) {
    return new commands[name](data, drawingCtxt);
  };
  this.objToCommand = function (obj, drawingCtxt) {
    return new command[obj.name](obj.data, drawingCtxt);
  };
  this.logToCommands = function (log) {
    return log.stack.slice(0, log.stackPos).map(objToCommand)
      .unshift(new commands.clear({}));
  };
};

//receiver
var drawingCtxt = function (context) {
  this.drawLine = function (data) {
    context.strokeStyle = data.color;
    context.beginPath();
    context.moveTo(data.x0, data.y0);
    context.lineTo(data.x1, data.y1);
    context.stroke();
    context.closePath();
  };
  this.drawPath = function (data) {
    const len = data.track.length;
    if(len > 0) {
      context.strokeStyle = data.color;
      context.beginPath();
      context.moveTo(data.track[0].x, data.track[0].y);
      for(var i = 1; i < len; ++i) {
        context.lineTo(data.track[i].x, data.track[i].y);
      }
      context.stroke();
      context.closePath();
    }
  };
  this.strokeRect = function (data) {
    context.strokeStyle = data.color;
    context.strokeRect(data.left, data.top, data.width, data.height);
  };
  this.clearRect = function (data) {
    context.clearRect(data.left, data.top, data.width, data.height);
  };
  this.fillRect = function (data) {
    context.fillStyle = data.color;
    context.fillRect(data.left, data.top, data.width, data.height);
  };
  this.clear = function () {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  };
};

var logger = function () {
  var that = this;
  function init() {
    that.getCommands();
  }

  this.stack = [];
  this.stackPos = 0;
  this.getCommands = function () {
    $.getJSON(window.canvas.id + '/history', function (history) {
      that.stackPos = history.pos;
      Array.prototype.push.apply(that.stack, history.arr);
    });
  };
  this.insert = function (command) {
    that.stack[that.stackPos++] = command.toObject();
    that.stack.length = that.stackPos;
  };

  init();
};

//invoker
var invoker = function (commandLog) {
  this.save = function (command) {
    if(commandLog) commandLog.insert(command);
    $.ajax({
      type: 'POST',
      url: '/' + window.canvas.id + '/command', 
      data: JSON.stringify(command.toObject()),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      beforeSend: function() {
        $('#loading').show();
      },
      success: function(res) {
        $('#loading').hide();
      },
      error: function(err) {
        $('#loading').hide();
      }
    });
  };
  this.execute = function () {
    for(var i = 0; i < arguments.length; ++i) {
      arguments[i].execute();
    }
  };
  this.saveAndExecute = function (command) {
    save(command);
    execute(command);
  };
  /*this.undo = function () {

  };*/
};

//commands
var commands = {
  drawPath: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.drawPath(data);
    };
    this.toObject = function () {
      return { name: 'drawPath', data: data };
    };
  },
  drawLine: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.drawLine(data);
    };
    this.toObject = function () {
      return { name: 'drawLine', data: data };
    };
  },
  strokeRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.strokeRect(data);
    };
    this.toObject = function () {
      return { name: 'strokeRect', data: data };
    };
  },
  fillRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.fillRect(data);
    };
    this.toObject = function () {
      return { name: 'fillRect', data: data };
    };
  },
  clearRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.clearRect(data);
    };
    this.toObject = function () {
      return { name: 'clearRect', data: data };
    };
  },
  rubber: function (data, drawingCtxt) {
    this.execute = function () {
      const len = data.track.length;
      const halfsize = data.size / 2;
      for (var i = 0; i < len; ++i) {
        drawingCtxt.fillRect({
          left: data.track[i].x - halfsize,
          top: data.track[i].y - halfsize,
          width: data.size,
          height: data.size,
          color: data.color
        });
      }
    };
    this.toObject = function () {
      return { name: 'rubber', data: data };
    };
  },
  clear: function (data, drawingCtxt) {
    this.execute = drawingCtxt.clear;
    this.toObject = function () {
      return { name: 'clear', data: data }
    };
  }
};
