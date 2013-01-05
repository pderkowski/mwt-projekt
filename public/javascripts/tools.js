var toolbox = function (perm_ctxt, temp_ctxt, icon_ctxt) {
  var tlbx = this;
  this.current_color = 'black';

  this.pencil = function () {
    var tool = this;
    this.started = false;
    this.track = [];

    this.mousedown = function (ev) {
      tool.x0 = ev._x;
      tool.y0 = ev._y;        
      temp_ctxt.strokeStyle = tlbx.current_color;
      tool.track.push({ x: ev._x, y: ev._y });
      tool.started = true;
    };

    this.mousemove = function (ev) {
      if (tool.started) {
        temp_ctxt.beginPath();
        temp_ctxt.moveTo(tool.x0, tool.y0);
        temp_ctxt.lineTo(ev._x, ev._y);
        temp_ctxt.stroke();
        temp_ctxt.closePath();
        tool.track.push({ x: ev._x, y: ev._y });
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        var this_command = new command('pencil', { track: tool.track, 
          color: tlbx.current_color });
        this_command.save();
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
      temp_ctxt.strokeStyle = tlbx.current_color;
      tool.started = true;
    };

    this.mousemove = function (ev) {
      if (tool.started) {
        tool.x = Math.min(ev._x,  tool.x0);
        tool.y = Math.min(ev._y,  tool.y0);
        tool.w = Math.abs(ev._x - tool.x0);
        tool.h = Math.abs(ev._y - tool.y0);

        temp_ctxt.clearRect(0, 0, temp_ctxt.canvas.width, temp_ctxt.canvas.height);

        if (!tool.w || !tool.h) {
          return;
        }
        temp_ctxt.strokeRect(tool.x, tool.y, tool.w, tool.h);
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        var this_command = new command('rect', { left: tool.x, top: tool.y,
          width: tool.w, height: tool.h, color: tlbx.current_color });
        this_command.save();
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
      temp_ctxt.strokeStyle = tlbx.current_color;
      tool.started = true;
    };

    this.mousemove = function (ev) {
      if (tool.started) {
        temp_ctxt.clearRect(0, 0, temp_ctxt.canvas.width, temp_ctxt.canvas.height);
        temp_ctxt.beginPath();
        temp_ctxt.moveTo(tool.x0, tool.y0);
        temp_ctxt.lineTo(ev._x, ev._y);
        temp_ctxt.stroke();
        temp_ctxt.closePath();
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        var this_command = new command('line', { x0: tool.x0, y0: tool.y0,
          x1: ev._x, y1: ev._y, color: tlbx.current_color });
        this_command.save();
        tlbx.img_update();
      }
    };

    this.mouseout = this.mouseup;
  };

  this.rubber = function () {
    var tool = this;
    const size = 10;
    this.started = false;
    icon_ctxt.strokeStyle = 'black';
    temp_ctxt.fillStyle = 'white';
    this.track = [];

    this.mousedown = function (ev) {
      tool.track.push({ x: ev._x, y: ev._y });
      tool.started = true;
    };

    this.mousemove = function (ev) {
      var l = Math.max(ev._x - size,  0),
          b = Math.max(ev._y - size,  0),
          r = Math.min(ev._x + size, temp_ctxt.canvas.width),
          t = Math.min(ev._y + size, temp_ctxt.canvas.height);

      icon_ctxt.clearRect(0, 0, icon_ctxt.canvas.width, icon_ctxt.canvas.height);
      icon_ctxt.strokeRect(l, b, r - l, t - b);
      if(tool.started) {
        temp_ctxt.fillRect(l, b, r - l, t - b);
        tool.track.push({ x: ev._x, y: ev._y });
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        var this_command = new command('rubber', { track: tool.track,
          size: size, color: temp_ctxt.fillStyle });
        this_command.save();
        tlbx.img_update();
      }
    };
    this.mouseout = function (ev) {
      mouseup(ev);
      icon_ctxt.clearRect(0, 0, icon_ctxt.canvas.width, icon_ctxt.canvas.height);
    };
  };

  this.img_update = function () {
    perm_ctxt.drawImage(temp_ctxt.canvas, 0, 0);
    temp_ctxt.clearRect(0, 0, temp_ctxt.canvas.width, temp_ctxt.canvas.height);
  };
};