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
    stack[stackPos++] = command.toObject();
    stack.length = stackPos;
  };
  this.changePos = function (diff) {
    if(diff)  stackPos = Math.min( Math.max(0, stackPos + diff), stack.length );
  };
  this.getCommands = function (begin, end) {
    var b = Math.max(0, begin) || 0;
    var e = Math.min(stackPos, end) || stackPos;
    return stack.slice(b, e);
  };
};

//invoker
var logger = function () {
  var commandLog;
  var that = this;

  function init() {
    $.getJSON(window.canvas.id + '/history', function (history) {
      commandLog = new log(history);
      that.getCommands = commandLog.getCommands;
      that.changePos = commandLog.changePos;
    });
  }
  this.insert = function (command) {
    if(commandLog.insert) commandLog.insert(command);
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
  init();
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

/*drawingCtxt:
  this.meta = {
    copy: function () {
      return context.canvas;
    },
    paste: function (image) {
      that.clear();
      context.drawImage(image, 0, 0);
    }
  };

logger:
  this.unbuffered = function () {
    return stack.slice(that.buffer.buffered, stackPos);
  }

this.buffer = (function (buffOptions) {
    var commandMaker = new client(buffOptions.drawingCtxt);
    var buffPos = 0;
    var buffMin = buffOptions.min || 5;
    var buffMax = buffOptions.max || 15;
    var buffProperSize = buffOptions.size || 10;
    return {
      buffUpdate: function () {
        var buffCurrentSize = stackPos - buffPos;
        var newBuffPos = Math.max(0, stackPos - buffProperSize);
        var toDoCommands = [];

        if(buffCurrentSize < buffMin && buffPos > 0) {
          toDoCommands = [(new commands.clear({})).toObject()]
            .concat(stack.slice(0, newBuffPos));
        } else if(buffCurrentSize > buffMax) {
          toDoCommands = stack.slice(buffPos, newBuffPos);
        }
        if(toDoCommands.length > 0) {
          commandMaker.logsToCommands(toDoCommands).forEach(function (that) {
            that.execute();
          });
          buffPos = newBuffPos;
        }
      },
      buffered: function () { return buffPos },
      copy: function () {
        return buffOptions.drawingCtxt.meta.copy();
      }
    }
  })(buffOptions);

  var logSync = function (logger, drawingCtxt) {
  var commandMaker = new client(drawingCtxt);
  var that = this;

  this.log = function (command) {
    logger.insert(command);
    
  };
  this.update = function () {
    //if(logger.buffer) {
    //  drawingCtxt.meta.paste(logger.buffer.copy());
    //}
    commandMaker.logsToCommands(logger.unbuffered()).forEach(function (that) {
      that.execute();
    });
  };
  this.undo = function () {
    logger.changePos(-1);
    that.update();
  };
  this.redo = function () {
    logger.changePos(1);
    that.update();
  };
};*/