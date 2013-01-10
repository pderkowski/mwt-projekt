$(document).ready(function() {
  var icon_cnv, icon_ctxt, temp_cnv, temp_ctxt, perm_cnv, perm_ctxt;

  var tool;
  var default_tool = 'pencil';
  var tools;
  var $container = $('#container');
  var $layers;

  function init () {
    perm_cnv = $('canvas#imageView')[0];
    if (!perm_cnv) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!perm_cnv.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    perm_ctxt = perm_cnv.getContext('2d');
    if (!perm_ctxt) {
      alert('Error: failed to getContext!');
      return;
    } else {
      var img = new Image();
      if(img && window.canvas.path) {
        img.src = window.canvas.path + '/' + window.picName;
        $(img).load(function () {
          perm_ctxt.drawImage(img,0,0);
        });
      }
    }

    temp_cnv = $('<canvas/>', {
          id: 'imageTemp',
          Width: perm_cnv.width,
          Height: perm_cnv.height
    })[0];
    if (!temp_cnv) {
      alert('Error: temp_cnv creation failed.');
      return;
    }
    $(temp_cnv).appendTo($container);

    if (!temp_cnv.getContext) {
      alert('Error: no temp_cnv.getContext!');
      return;
    }
    temp_ctxt = temp_cnv.getContext('2d');

    icon_cnv = $('<canvas/>', {
          id: 'iconLayer',
          Width: perm_cnv.width,
          Height: perm_cnv.height
    })[0];
    if (!icon_cnv) {
      alert('Error: icon_cnv creation failed.');
      return;
    }
    $(icon_cnv).appendTo($container);
    if (!icon_cnv.getContext) {
      alert('Error: no icon_cnv.getContext!');
      return;
    }
    icon_ctxt = icon_cnv.getContext('2d');

    tools = new toolbox(perm_ctxt, temp_ctxt, icon_ctxt);

    if (tools[default_tool]) {
      tool = new tools[default_tool]();
    }

    var tool_select = $('input[name="tool"]');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.click(ev_tool_change);

    var color_input = $('input[name="color"]')[0];
    if (!color_input) {
      alert('Error: failed to get the color input!');
      return;
    }
    $(color_input).change(function () {
      tools.current_color = color_input.value;
    });
    icon_cnv.addEventListener('mousedown', ev_canvas, false);
    icon_cnv.addEventListener('mousemove', ev_canvas, false);
    icon_cnv.addEventListener('mouseup',   ev_canvas, false);
    icon_cnv.addEventListener('mouseout', ev_canvas, false);
    icon_cnv.addEventListener('mouseover', ev_canvas, false);

    console.log('Canvas initialized.');
  }
  function ev_canvas (ev) {
    ev._x = Math.max(ev.pageX - $container.offset().left, 0);
    ev._y = Math.max(ev.pageY - $container.offset().top, 0);
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
      temp_ctxt.clearRect(0, 0, temp_cnv.width, temp_cnv.height);
    }
  }

  $('input#replay').click(function(event) {
    var replay = new canvasClient();
    var replayCtxt = new drawingCtxt(perm_ctxt);
    $.getJSON(window.canvas.id + '/history', function (history) {
      replay.command('clear', {}, replayCtxt).execute();
      for(var i = 0; i < history.pos; ++i) {
        (function (i) {
          setTimeout(replay.command(history.arr[i].name, history.arr[i].data, 
            replayCtxt).execute, 400*(i+1));
        })(i);
      }
    });
  });

  init();
});
