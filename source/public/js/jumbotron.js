$(function() {
  var visible = Cookies.get('jumbotron-visible') || true;
  if (visible === true) {
    $('.jumbotron').show();
  }
  $('.jumbotron .close').click(function() {
    $('.jumbotron').hide();
    Cookies.set('jumbotron-visible', false, { expires: 365 });
  });
});
