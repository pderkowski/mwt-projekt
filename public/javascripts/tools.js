$(document).ready(function() {
  var canvas, context, canvaso, contexto;

  var tool;
  var default_tool = 'pencil';

  function init () {
    // Find the canvas element.

    canvaso = $('canvas#imageView')[0];
    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }
    else {
      var img = new Image();
      if(img && window.canvas.path) {
        img.src = window.canvas.path + '/' + window.picName;
        $(img).load(function () {
          contexto.drawImage(img,0,0);
        });
      }
    }

    //-----------------------------
    canvas = $('<canvas/>', {
          id: 'imageTemp',
          Width: canvaso.width,
          Height: canvaso.height
    })[0];
    if (!canvas) {
      alert('Error: canvas creation failed.');
      return;
    }
    $(canvas).appendTo($(canvaso).parent());
    //-----------------------------

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
    context = canvas.getContext('2d');
    context.fillStyle = "white";

    // Get the tool select input.
    var tool_select = $('input[name="tool"]');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.bind('click', ev_tool_change);

    var color_input = $('input[name="color"]')[0];
    if (!color_input) {
      alert('Error: failed to get the color input!');
      return;
    }
    $(color_input).bind('change', function () {
      tools.current_color = color_input.value;

    });

    // Activate the default tool.
    if (tools[default_tool]) {
      tool = new tools[default_tool]();
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
    $(canvas).bind('mouseleave', function () {
      context.clearRect(0,0,canvas.width,canvas.height);
    });
    console.log('Canvas initialized.');
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {
    current_color: 'black'
  };

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.strokeStyle = tools.current_color;
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
      context.strokeStyle = tools.current_color;
      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.strokeStyle = tools.current_color;
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  tools.rubber = function () {
    var tool = this;
    const size = 10;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
    };

    this.mousemove = function (ev) {
      var l = Math.max(ev._x - size,  0),
          b = Math.max(ev._y - size,  0),
          r = Math.min(ev._x + size, canvas.width),
          t = Math.min(ev._y + size, canvas.height);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = 'black';
      context.strokeRect(l, b, r - l, t - b);
      context.fillRect(l, b, r - l, t - b);

      if (!tool.started) {
        return;
      }
      
      contexto.clearRect(l, b, r - l, t - b);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
      }
    };
  };

  init();
});
