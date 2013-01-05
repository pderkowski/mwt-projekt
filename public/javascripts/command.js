var command = function(type, data) {
  this.type = type;
  this.data = data;
};

command.prototype.save = function() {
  $.ajax({
    type: 'POST',
    url: '/' + window.canvas.id + '/command', 
    data: JSON.stringify(this),
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