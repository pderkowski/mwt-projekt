var toolbox = function (perm_ctxt, temp_ctxt, icon_ctxt) {
  var tlbx = this;
  this.current_color = 'black';

  this.pencil = function () {
    var tool = this;
    this.started = false;
    this.current_color = 'black';

    this.mousedown = function (ev) {
      tool.x0 = ev._x;
      tool.y0 = ev._y;        
      temp_ctxt.strokeStyle = tlbx.current_color;
      tool.started = true;
    };

    this.mousemove = function (ev) {
      if (tool.started) {
        temp_ctxt.beginPath();
        temp_ctxt.moveTo(tool.x0, tool.y0);
        temp_ctxt.lineTo(ev._x, ev._y);
        temp_ctxt.stroke();
        temp_ctxt.closePath();
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        tlbx.img_update();
      }
    };

    this.mouseout = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tlbx.img_update();
      }
    };

    this.mouseover = function (ev) {
      if(tool.started) {
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };
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
        var x = Math.min(ev._x,  tool.x0),
            y = Math.min(ev._y,  tool.y0),
            w = Math.abs(ev._x - tool.x0),
            h = Math.abs(ev._y - tool.y0);

        temp_ctxt.clearRect(0, 0, temp_ctxt.canvas.width, temp_ctxt.canvas.height);

        if (!w || !h) {
          return;
        }
        temp_ctxt.strokeRect(x, y, w, h);
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        tlbx.img_update();
      }
    };

    this.mouseout = this.mouseup;
  };

  this.line = function () {
    var tool = this;
    this.started = false;
    this.current_color = 'black';

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

    this.mousedown = function (ev) {
      tool.started = true;
    };

    this.mousemove = function (ev) {
      var l = Math.max(ev._x - size,  0),
          b = Math.max(ev._y - size,  0),
          r = Math.min(ev._x + size, temp_ctxt.canvas.width),
          t = Math.min(ev._y + size, temp_ctxt.canvas.height);

      icon_ctxt.clearRect(0, 0, icon_ctxt.canvas.width, icon_ctxt.canvas.height);
      icon_ctxt.strokeRect(l, b, r - l, t - b);
      if(tool.started) temp_ctxt.fillRect(l, b, r - l, t - b);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        tlbx.img_update();
      }
    };
    this.mouseout = function (ev) {
      if(tool.started) {
        tool.mousemove(ev);
        tlbx.img_update();
      }
      icon_ctxt.clearRect(0, 0, icon_ctxt.canvas.width, icon_ctxt.canvas.height);
    };
  };

  this.img_update = function () {
    perm_ctxt.drawImage(temp_ctxt.canvas, 0, 0);
    temp_ctxt.clearRect(0, 0, temp_ctxt.canvas.width, temp_ctxt.canvas.height);
  };
};