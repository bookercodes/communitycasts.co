$(function() {

  function buildApiUrl(parts, id, key) {
    var base = "https://www.googleapis.com/youtube/v3/videos";
    return base + "?part=" + parts + "&id=" + id + "&key=" + key;
  }
  
  $("#url").change(function() {
    var videoUrl = $(this).val();
    var id = videoUrl;
    var parts = "snippet,contentDetails";
    var key = "AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk";
    var apiUrl = buildApiUrl(parts, id, key);

    $.get(apiUrl, function(data) {
      var item = data.items[0];
      $("#title").val(item.snippet.title);
      $("#description").val(item.snippet.description);
      $("#channelName").val(item.snippet.channelTitle);
    });
  });
}());