$(function() {

  // Functions
  function attainDistinctTags(value) {
    var tags = value.split(',');
    tags = tags.filter(function(tag) { return /\S/.test(tag) });
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
    var key = "AIzaSyAMkYVIPo7ZuX5lWjLvSXCcG0zBuBy799U";
    return base + "?part=" + parts + "&id=" + id + "&key=" + key;
  }

  // Validation
  $.validator.addMethod("youtubeVideoUrl", function (value, element) {
    return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(value);
  }, "Please enter a valid YouTube video url.");
  $.validator.addMethod("maximumOf2Tags", function (value, element) {
    var tags = attainDistinctTags(value);
    return tags.length <= 2;
  }, "You cannot enter more than two tags.");
  $("#submitForm").validate({
    ignore: [],
    errorElement: "span",
    errorClass: "help-block",
    highlight: function(element) {
      $(element)
        .closest('.form-group')
        .addClass('has-error')
        .removeClass('has-success');
    },
    unhighlight: function(element) {
      $(element)
        .closest('.form-group')
        .addClass('has-success')
        .removeClass('has-error');
    },
    rules: {
      url: {
        required: true,
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
      tags: {
        required: true,
        maximumOf2Tags: true
      }
    },
    messages: {
      url: {
        required: "Please enter a screencast link.",
        remote: "This video does not exist."
      },
      tags: {
        required: 'Please enter at least one tag.'
      }
    }
  });

  // Automatic title and description loading
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

  // Tag input control
  $("#tags-input").keyup(function() {
    var tags = attainDistinctTags($(this).val());
    $("#tag-list").empty();
    tags.forEach(function(tag) {
      $("#tag-list").append("<li> <span class=\"fa fa-tag\"></span>" + tag + "</li>");
    });
  });

  // Tag autocomplete
  function split(val) {
    return val.split(/,\s*/);
  }
  function extractLast(term) {
    return split(term).pop();
  }
  $('#tags-input').bind('keydown', function(event) {
    if ( event.keyCode === $.ui.keyCode.TAB &&
      $( this ).autocomplete( "instance" ).menu.active ) {
        event.preventDefault();
      }
  }).autocomplete({
    source: function( request, response ) {
      $.getJSON( "/api/tags", {
        term: extractLast( request.term )
      }, response );
    },
    focus: function() {
      return false;
    },
    select: function( event, ui ) {
      var terms = split( this.value );
      terms.pop();
      terms.push( ui.item.value );
      terms.push( "" );
      this.value = terms.join( ", " );
      return false;
    }
  });

});
