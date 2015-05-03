$(function() {

  var technologies = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: './api/technologies',
      filter: function(list) {
        return $.map(list, function(technology) {
          return { name: technology.technologyName }; });
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

  // jQuery validator only performs validation upon an input element losing focus or a key being pressed up. Because
  // the #technologies input is hidden and updated by the bootstrap-tagsinput plugin, we need to manually invoke
  // the "valid" method.
  $('#technologies').on('itemAdded', function(event) {
    $(this).valid();
  });
  $('#technologies').on('itemRemoved', function(event) {
    $(this).valid();
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
        youtubeVideoUrl: true
      },
      technologies: {
        required: true
      }
    },
    messages: {
      technologies: {
        required: 'Please enter at least one technology.'
      }
    }
  });

  $("#technologies").change(function(e){
    console.log('my value changed');
    validator.valid();
  });

  // http://stackoverflow.com/a/9102270/4804328
  function extractId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    }
  }

  function buildApiUrl(parts, id, key) {
    var base = "https://www.googleapis.com/youtube/v3/videos";
    return base + "?part=" + parts + "&id=" + id + "&key=" + key;
  }

  $("#url").change(function() {
    var videoUrl = $(this).val();

    if(!$(this)[0].checkValidity()) {
      return;
    }

    var id = extractId(videoUrl);
    var parts = "snippet,contentDetails";
    var key = "AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk";
    var apiUrl = buildApiUrl(parts, id, key);

    $.get(apiUrl, function(data) {
      var item = data.items[0];
      if (item == undefined) {
        $("#title").val('');
        $("#description").val('');
        $("#channelName").val('');
        // validator.showErrors({
        //   "url": "This video does not exist."
        // });
      } else {
        $("#title").val(item.snippet.title);
        $("#description").val(item.snippet.description);
        $("#channelName").val(item.snippet.channelTitle);
      }
    });
  });


}());