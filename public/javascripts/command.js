//client
var client = function (fixedCtxt) {
  var that = this;
  this.command = function (name, data, drawingCtxt) {
    return new commands[name](data, fixedCtxt || drawingCtxt);
  };
  this.objToCommand = function (obj, drawingCtxt) {
    return new commands[obj.name](obj.data, fixedCtxt || drawingCtxt);
  };
  this.logsToCommands = function (logs, drawingCtxt) {
    var res = [];
    for(var i = 0; i < logs.length; ++i) {
      res.push(that.objToCommand(logs[i], fixedCtxt || drawingCtxt));
    }
    return res;
  };
};

//receiver
var drawingCtxt = function (context) {
  var that = this;

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

var log = function (history) {
  var that = this;
  var stack = history.arr;
  var stackPos = history.pos;

  this.insert = function (command) {
    if( command.name && command.data ) {
      stack[stackPos++] = command;
    } else if( $.isFunction(command.toObject) ) {
      stack[stackPos++] = command.toObject();
    } else {
      return;
    }
    stack.length = stackPos;
  };
  this.changePos = function (diff) {
    var before = stackPos;
    if(diff) {
      stackPos = Math.min( Math.max(0, stackPos + diff), stack.length );
    } 
    return stackPos - before;
  };
  this.getCommands = function (begin, end) {
    var b = Math.max(0, begin) || 0;
    var e = Math.min(stackPos, end) || stackPos;
    return stack.slice(b, e);
  };
};

//invoker
var logger = function (renderer) {
  var commandLog;
  var server = new socket(this, 'http://localhost');
  var that = this;

  (function init() {
    server.getCommands(function (commands) {
      commandLog = new log(commands); 
      that.render();
    });
  })();

  this.insert = function (command, flags) {
    if(commandLog.insert) {
      commandLog.insert(command);
      if(!flags || !flags.synced) {
        server.insert(command);
      }
      if((!flags || flags.render) && renderer) {
        that.render();
      }
    }
  };
  this.undo = function (flags) {
    if( commandLog.changePos(-1) ) {
      if(!flags || !flags.synced) {
        server.undo();
      }
      if((!flags || flags.render) && renderer) {
        that.render();
      }
    }
  };
  this.redo = function (flags) {
    if( commandLog.changePos(1) ) {
      if(!flags || !flags.synced) {
        server.redo();
      }
      if((!flags || flags.render) && renderer) {
        that.render();
      }
    }
  };
  this.render = function (delay = 0) {
    renderer.command('clear', {}).execute();
    //alert('after');
    renderer.logsToCommands(commandLog.getCommands())
      .forEach(function (command, i) {
        setTimeout(command.execute, delay*(i+1));
      });
  };
};

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
      for (var i = 0; i < len; ++i) {
        drawingCtxt.fillRect({
          left: data.track[i].x - data.size,
          top: data.track[i].y - data.size,
          width: 2 * data.size,
          height: 2 * data.size,
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