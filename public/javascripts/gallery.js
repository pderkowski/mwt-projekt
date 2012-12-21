$(document).ready(function () {
  $('a.delete').click(function (event) {
    event.preventDefault();
    var $this = $(this),
        $row = $this.closest('tr');     
    $.ajax({
      type: 'POST',
      url: $this.attr('href'),
      success: function(data) {
        $row.children("td").each(function() {
            $(this)
              .animate({ 
                padding: '0px'
              }, 'slow')
              .wrapInner("<div/>")
              .children("div")
              .slideUp('slow', function() {
                $row.remove();
              });
        });
      }
    });
  });
});