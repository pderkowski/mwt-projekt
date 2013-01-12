$(document).ready(function() {
  var icon_cnv, icon_ctxt, temp_cnv, temp_ctxt, perm_cnv, perm_ctxt, buff_cnv,
    buff_ctxt;

  var tool;
  var default_tool = 'pencil';
  var tools;
  var $container = $('#container');

  function init () {
    perm_cnv = $('canvas#imageView')[0];
    if (!perm_cnv) {
      alert('Error: I cannot find the canvas element!');
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
      } else {
        perm_ctxt.fillStyle = 'white';
        perm_ctxt.fillRect(0, 0, perm_cnv.width, perm_cnv.height);
      }
    }

    buff_cnv = $('canvas#imageBuffer')[0];
    if (!buff_cnv) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!buff_cnv.getContext) {
      alert('Error: no buff_cnv.getContext!');
      return;
    }
    buff_ctxt = buff_cnv.getContext('2d');

    temp_cnv = $('canvas#imageTemp')[0];
    if (!temp_cnv) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!temp_cnv.getContext) {
      alert('Error: no temp_cnv.getContext!');
      return;
    }
    temp_ctxt = temp_cnv.getContext('2d');

    icon_cnv = $('canvas#iconLayer')[0];
    if (!icon_cnv) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!icon_cnv.getContext) {
      alert('Error: no icon_cnv.getContext!');
      return;
    }
    icon_ctxt = icon_cnv.getContext('2d');

    tools = new toolbox(perm_ctxt, temp_ctxt, icon_ctxt, buff_ctxt);

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
      tools.settings.current_color = color_input.value;
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

  $('input#replay').click(function (event) {
    tools.actions.replay(300);
  });

  $('input#undo').click(function (event) {
    tools.actions.undo();
  });

  $('input#redo').click(function (event) {
    tools.actions.redo();
  });

  init();
});
