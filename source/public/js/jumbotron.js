$(function() {
  
  var x = getCookie('jumbotron-visible');
  if (x != "false") {
    $(".jumbotron").show();
  }
  
  $(".jumbotron button.close").click(function() {
    $(".jumbotron").hide();
    setCookie('jumbotron-visible', 'false');
  });

  function setCookie(c_name, value) {
    Cookies.set(c_name, value, { expires: 365 });
  }

  function getCookie(c_name) {
    return Cookies.get(c_name);
  }  
});

