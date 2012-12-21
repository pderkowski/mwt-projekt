$('input#save').click(function (event) {
  var canvas = $('canvas#imageView')[0];
  var image;
  
  if (!canvas) {
    alert('Error: I cannot find the canvas element!');
    return;
  } else {
    image = canvas.toDataURL("image/png");
    image = image.replace('data:image/png;base64,', '');
  }

  $.ajax({
    type: 'POST',
    url: '/save',
    data: '{ "id" : "' + window.canvas.id + '", "imageData" : "' + image +'" }',
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
});