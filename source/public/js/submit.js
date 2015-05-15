$(function() {



  function attainDistinctTags(value) {
    var tags = value.split(',');
    tags = tags.filter(function(tag) { return tag != '' });
    tags = tags.filter(function(item, pos, self) { return self.indexOf(item) == pos; });
    return tags;
  }
  
  function parseVideoId(url) {
    var pattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(pattern);
    if (match && match[2].length == 11) {
      return match[2];
    }
  }

  function buildVideoApiUrl(id) {
    var base = "https://www.googleapis.com/youtube/v3/videos";
    var parts = "snippet,contentDetails";
    var key = "AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk";
    return base + "?part=" + parts + "&id=" + id + "&key=" + key;
  }

  $("#url").change(function() {
    var videoUrl = $(this).val();
    // if the input is not a valid YouTube url, return.
    if(!$(this)[0].checkValidity()) {
      return;
    }
    var id = parseVideoId(videoUrl);
    var apiUrl = buildVideoApiUrl(id);
    $.get(apiUrl, function(data) {
      var item = data.items[0];
      // if the video does not exist
      if (item == undefined) {
        $("#title").val('');
        $("#description").val('');
        $("#channelName").val('');
      } else {
        $("#title").val(item.snippet.title);
        $("#description").val(item.snippet.description);
        $("#channelName").val(item.snippet.channelTitle);
      }
    });
  });

  $("#technologies").keyup(function() {
    var tags = attainDistinctTags($(this).val());
    $("#tags").empty();
    tags.forEach(function(tag) {
      $("#tags").append("<li> <span class=\"fa fa-tag\"></span>" + tag + "</li>");
    });
  });
  
  $.validator.addMethod("youtubeVideoUrl", function (value, element) {
    return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(value);
  }, "Please enter a valid YouTube video url.");

  $.validator.addMethod("maximumOf2Tags", function (value, element) {
    var tags = attainDistinctTags(value);
    return tags.length <= 2;
  }, "You cannot enter more than two tags.");

  var validationRules = {
    url: {
      youtubeVideoUrl: true,
      remote: function () {
        return {
          url: buildVideoApiUrl(parseVideoId($("#url").val())),
          dataFilter: function(response) {
            var json = JSON.parse(response);
            return json.items.length !== 0;
          }
        };
      }
    },
    technologies: {
      required: true,
      maximumOf2Tags: true
    }
  };

  var validationMessages = {
    url: {
      remote: "This video does not exist."
    },
    technologies: {
      required: 'Please enter at least one technology.'
    }
  };

  $("#submitForm").validate({
    ignore: [],
    errorElement: "span",
    errorClass: "help-block",
    highlight: function(element) {
      $(element)
        .closest('.form-group')
        .addClass('has-error');
    },
    unhighlight: function(element) {
      $(element)
        .closest('.form-group')
        .removeClass('has-error');
    },
    rules: validationRules,
    messages: validationMessages
  });
  
});