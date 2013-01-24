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
    context.strokeStyle = data.settings.color;
    context.lineWidth = data.settings.lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(data.x0, data.y0);
    context.lineTo(data.x1, data.y1);
    context.stroke();
  };
  this.drawPath = function (data) {
    const len = data.track.length;
    if(len > 0) {
      context.strokeStyle = data.settings.color;
      context.lineWidth = data.settings.lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(data.track[0].x, data.track[0].y);
      for(var i = 1; i < len; ++i) {
        context.lineTo(data.track[i].x, data.track[i].y);
      }
      context.stroke();
    }
  };
  this.drawCircle = function (data) {
    context.strokeStyle = data.settings.color;
    context.lineWidth = data.settings.lineWidth;
    context.beginPath();
    context.arc(data.x, data.y, data.radius, 0, 2 * Math.PI, false);
    context.stroke();
  };
  this.strokeRect = function (data) {
    context.strokeStyle = data.settings.color;
    context.lineWidth = data.settings.lineWidth;
    context.lineCap = 'miter';
    context.lineJoin = 'miter';
    context.strokeRect(data.left, data.top, data.width, data.height);
  };
  this.clearRect = function (data) {
    context.clearRect(data.left, data.top, data.width, data.height);
  };
  this.fillRect = function (data) {
    context.fillStyle = data.settings.color;
    context.fillRect(data.left, data.top, data.width, data.height);
  };
  this.clear = function (data) {
    if(data && data.settings && data.settings.color) {
      context.fillStyle = data.settings.color;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    } else {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
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
    var b = Math.max(0, (begin + stackPos) % stackPos) || 0;
    var e = Math.min((end + stackPos) % stackPos, stackPos) || stackPos;
    return stack.slice(b, e);
  };
  this.clear = function () {
    if(stack.length > 0) {
      stack.length = 0;
      stackPos = 0;
      return true;
    } else {
      return false;
    }
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
        that.render(-1);
      }
    }
  };
  this.undo = function (flags) {
    if( commandLog.changePos && commandLog.changePos(-1) ) {
      if(!flags || !flags.synced) {
        server.undo();
      }
      if((!flags || flags.render) && renderer) {
        that.render();
      }
    }
  };
  this.redo = function (flags) {
    if( commandLog.changePos && commandLog.changePos(1) ) {
      if(!flags || !flags.synced) {
        server.redo();
      }
      if((!flags || flags.render) && renderer) {
        that.render(-1);
      }
    }
  };
  this.clear = function (flags) {
    if( commandLog.clear && commandLog.clear() ) {
      if(!flags || !flags.synced) {
        server.clear();
      }
      if((!flags || flags.render) && renderer) {
        that.render();
      }
    }
  };
  this.render = function (startingPos, delay) { //will render commands from startingPos in command array to the stackPos, e.g. render(-1, 0) will immediately render last command
    delay = typeof delay !== 'undefined' ? delay : 0;
    if(!startingPos) {
      renderer.command('clear', { settings: { color: 'white' } }).execute();
    }
    //alert('after');
    renderer.logsToCommands(commandLog.getCommands(startingPos))
      .forEach(function (command, i) {
        command.execute( delay*(i+1) );
      });
  };
};

var commands = {
  drawPath: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.drawPath.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'drawPath', data: data };
    };
  },
  drawLine: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.drawLine.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'drawLine', data: data };
    };
  },
  drawCircle: function (data, drawingCtxt) {
    this.execute =function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.drawCircle.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'drawCircle', data: data };
    };
  },
  strokeRect: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.strokeRect.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'strokeRect', data: data };
    };
  },
  fillRect: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.fillRect.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'fillRect', data: data };
    };
  },
  clearRect: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.clearRect.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'clearRect', data: data };
    };
  },
  rubber: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      const len = data.track.length;
      setTimeout( function () {
        for (var i = 0; i < len; ++i) {
          drawingCtxt.fillRect({
            left: data.track[i].x - data.size,
            top: data.track[i].y - data.size,
            width: 2 * data.size,
            height: 2 * data.size,
            settings: data.settings
          });
        }
      }, timeout );
    };
    this.toObject = function () {
      return { name: 'rubber', data: data };
    };
  },
  clear: function (data, drawingCtxt) {
    this.execute = function (timeout) {
      if (typeof(timeout) === 'undefined') timeout = 0;
      setTimeout( drawingCtxt.clear.bind(drawingCtxt, data), timeout );
    };
    this.toObject = function () {
      return { name: 'clear', data: data }
    };
  }
};