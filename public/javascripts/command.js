//client
var canvasClient = function () {
  this.command = function (type, data, drawingCtxt) {
    return new commands[type](data, drawingCtxt);
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

//invoker
var invoker = function () {
  this.save = function (command) {
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
  this.execute = function (command) {
    command.execute();
  };
  this.saveAndExecute = function (command) {
    save(command);
    execute(command);
  };
};

//commands
var commands = {
  drawPath: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.drawPath(data);
    };
    this.toObject = function () {
      return { type: 'drawPath', data: data };
    };
  },
  drawLine: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.drawLine(data);
    };
    this.toObject = function () {
      return { type: 'drawLine', data: data };
    };
  },
  strokeRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.strokeRect(data);
    };
    this.toObject = function () {
      return { type: 'strokeRect', data: data };
    };
  },
  fillRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.fillRect(data);
    };
    this.toObject = function () {
      return { type: 'fillRect', data: data };
    };
  },
  clearRect: function (data, drawingCtxt) {
    this.execute = function () {
      drawingCtxt.clearRect(data);
    };
    this.toObject = function () {
      return { type: 'clearRect', data: data };
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
      return { type: 'rubber', data: data };
    };
  },
  clear: function (data, drawingCtxt) {
    this.execute = drawingCtxt.clear;
    this.toObject = function () {
      return { type: 'clear', data: data }
    };
  }
};
