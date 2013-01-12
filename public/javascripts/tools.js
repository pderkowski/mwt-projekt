var toolbox = function (perm_ctxt, temp_ctxt, icon_ctxt, buff_ctxt) {
  var tlbx = this;
  var drawPerm = new drawingCtxt(perm_ctxt),
      drawTemp = new drawingCtxt(temp_ctxt),
      drawIcon = new drawingCtxt(icon_ctxt);
  var user = new client();
  var commandLogger = new logger();

  this.actions = {
    undo: function () {
      commandLogger.changePos(-1);
      tlbx.actions.replay(0);
    },
    redo: function () {
      commandLogger.changePos(1);
      tlbx.actions.replay(0);
    },
    replay: function (delay) {
      user.command('clear', {}, drawPerm).execute();
      user.logsToCommands(commandLogger.getCommands(), drawPerm)
        .forEach(function (command, i) {
          setTimeout(command.execute, delay*(i+1));
        });
    }
  };
  this.settings = {
    current_color: 'black'
  };

  this.pencil = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.x0 = ev._x;
      tool.y0 = ev._y;        
      tool.track = [{ x: ev._x, y: ev._y }];
      tool.started = true;
    };
    this.mousemove = function (ev) {
      if (tool.started) {
        user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0,
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.settings.current_color 
        }, drawTemp).execute();
        tool.track.push({ x: ev._x, y: ev._y });
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        commandLogger.insert(user.command('drawPath', { 
          track: tool.track,
          color: tlbx.settings.current_color 
        }, drawPerm));
        tlbx.img_update();
      }
    };
    this.mouseout = this.mouseup;
  };

  this.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.x0 = ev._x;
      tool.y0 = ev._y;
      tool.started = true;
    };
    this.mousemove = function (ev) {
      if (tool.started) {
        tool.l = Math.min(ev._x,  tool.x0);
        tool.t = Math.min(ev._y,  tool.y0);
        tool.w = Math.abs(ev._x - tool.x0);
        tool.h = Math.abs(ev._y - tool.y0);

        user.command('clear', {}, drawTemp).execute();

        if (tool.w && tool.h) {
          user.command('strokeRect', { 
            left: tool.l, 
            top: tool.t, 
            width: tool.w,
            height: tool.h, 
            color: tlbx.settings.current_color 
          }, drawTemp).execute();
        }
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        commandLogger.insert(user.command('strokeRect', { 
          left: tool.l, 
          top: tool.t, 
          width: tool.w, 
          height: tool.h, 
          color: tlbx.settings.current_color 
        }, drawPerm));
        tlbx.img_update();
      }
    };
    this.mouseout = this.mouseup;
  };

  this.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.x0 = ev._x;
      tool.y0 = ev._y;
      tool.started = true;
    };
    this.mousemove = function (ev) {
      if (tool.started) {
        user.command('clear', {}, drawTemp).execute();
        user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0, 
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.settings.current_color 
        }, drawTemp).execute();
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        commandLogger.insert(user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0, 
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.settings.current_color 
        }, drawPerm));
        tlbx.img_update();
      }
    };
    this.mouseout = this.mouseup;
  };

  this.rubber = function () {
    var tool = this;
    const size = 10;
    const strokeColor = 'black';
    const fillColor = 'white';
    this.started = false;

    this.mousedown = function (ev) {
      tool.track = [{ x: ev._x, y: ev._y }];
      tool.started = true;
    };
    this.mousemove = function (ev) {
      var l = Math.max(ev._x - size,  0),
          t = Math.max(ev._y - size,  0),
          r = Math.min(ev._x + size, temp_ctxt.canvas.width),
          b = Math.min(ev._y + size, temp_ctxt.canvas.height);

      user.command('clear', {}, drawIcon).execute();
      user.command('strokeRect', {
        left: l, 
        top: t,
        width: r - l,
        height: b - t,
        color: strokeColor
      }, drawIcon).execute();

      if(tool.started) {
        user.command('fillRect', {
          left: l, 
          top: t,
          width: r - l,
          height: b - t,
          color: fillColor
        }, drawTemp).execute();
        tool.track.push({ x: ev._x, y: ev._y });
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        commandLogger.insert(user.command('rubber', {
          track: tool.track,
          size: size,
          color: fillColor
        }), drawPerm);
        tlbx.img_update();
      }
    };
    this.mouseout = function (ev) {
      user.command('clear', {}, drawIcon).execute();
      tool.mouseup(ev);
    };
  };

  this.img_update = function () {
    perm_ctxt.drawImage(temp_ctxt.canvas, 0, 0);
    user.command('clear', {}, drawTemp).execute();
  };
};

  /*var buffOptions = {
    min: 5,
    max: 15,
    size: 10,
    drawingCtxt: drawBuff
  };*/