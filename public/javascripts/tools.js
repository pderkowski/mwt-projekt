var toolbox = function (perm_ctxt, temp_ctxt, icon_ctxt) {
  var tlbx = this;
  this.current_color = 'black';
  var user = new canvasClient();
  var commandLog = new logger();
  var actionHandler = new invoker(commandLog);
  var drawPerm = new drawingCtxt(perm_ctxt),
      drawTemp = new drawingCtxt(temp_ctxt),
      drawIcon = new drawingCtxt(icon_ctxt);

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
        actionHandler.execute(user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0,
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.current_color 
        }, drawTemp));
        tool.track.push({ x: ev._x, y: ev._y });
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        actionHandler.save(user.command('drawPath', { 
          track: tool.track,
          color: tlbx.current_color 
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

        actionHandler.execute(user.command('clear', {}, drawTemp));

        if (tool.w && tool.h) {
          actionHandler.execute(user.command('strokeRect', { 
            left: tool.l, 
            top: tool.t, 
            width: tool.w,
            height: tool.h, 
            color: tlbx.current_color 
          }, drawTemp));
        }
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        actionHandler.save(user.command('strokeRect', { 
          left: tool.x, 
          top: tool.y, 
          width: tool.w, 
          height: tool.h, 
          color: tlbx.current_color 
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
        actionHandler.execute(user.command('clear', {}, drawTemp));
        actionHandler.execute(user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0, 
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.current_color 
        }, drawTemp));
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        actionHandler.save(user.command('drawLine', { 
          x0: tool.x0, 
          y0: tool.y0, 
          x1: ev._x, 
          y1: ev._y, 
          color: tlbx.current_color 
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

      actionHandler.execute(user.command('clear', {}, drawIcon));
      actionHandler.execute(user.command('strokeRect', {
        left: l, 
        top: t,
        width: r - l,
        height: b - t,
        color: strokeColor
      }, drawIcon));

      if(tool.started) {
        actionHandler.execute(user.command('fillRect', {
          left: l, 
          top: t,
          width: r - l,
          height: b - t,
          color: fillColor
        }, drawTemp));
        tool.track.push({ x: ev._x, y: ev._y });
      }
    };
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        actionHandler.save(user.command('rubber', {
          track: tool.track,
          size: size,
          color: fillColor
        }), drawPerm);
        tlbx.img_update();
      }
    };
    this.mouseout = function (ev) {
      actionHandler.execute(user.command('clear', {}, drawIcon));
      mouseup(ev);
    };
  };

  this.img_update = function () {
    perm_ctxt.drawImage(temp_ctxt.canvas, 0, 0);
    actionHandler.execute(user.command('clear', {}, drawTemp));
  };
};