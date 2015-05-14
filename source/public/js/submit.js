$(function() {

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

  var technologies = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: '../api/tags',
      filter: function(list) {
        return $.map(list, function(tag) {
          return { name: tag.tagName }; });
      }
    }
  });
  technologies.initialize();
  var tagsInput = $("#technologies").tagsinput({
    maxTags: 2,
    typeaheadjs: {
        name: 'technologies',
        displayKey: 'name',
        valueKey: 'name',
        highlight: true,
        source: technologies.ttAdapter()
      }
  });

  $.validator.addMethod("youtubeVideoUrl", function (value, element) {
    return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(value);
  }, "Please enter a valid YouTube video url.");

  var validator = $("#submitForm").validate({
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
    errorPlacement: function(error, element) {
      if(element.attr("id") === "technologies") {
        error.insertAfter($(".bootstrap-tagsinput"));
      } else {
        error.insertAfter(element);
      }
    },
    rules: {
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
        required: true
      }
    },
    messages: {
      url: {
        remote: "This video does not exist."
      },
      technologies: {
        required: 'Please enter at least one technology.'
      }
    }
  });

  // jQuery validator only performs validation upon an input element losing focus or a key being pressed up. Because
  // the #technologies input is hidden and updated by the bootstrap-tagsinput plugin, we need to manually invoke
  // the "valid" method.
  $('#technologies').on('itemAdded', function(event) {
    $(this).valid();
  });
  $('#technologies').on('itemRemoved', function(event) {
    $(this).valid();
  });

  $("#technologies").change(function(e){
    validator.valid();
  });

});