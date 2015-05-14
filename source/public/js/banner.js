$(function() {
  
  var x = Cookies.get('banner-visible');

  if (x == undefined) {
    $(".banner").show();
  }

  $(".banner button.close").click(function() {
    $(".banner").hide();
    Cookies.set(
      'banner-visible', 
      'false', 
      { expires: 365 });
  });
});

