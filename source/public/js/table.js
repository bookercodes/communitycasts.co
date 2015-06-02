function sprintf (str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
};
  
function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function titleFormatter(value, row) {
  return sprintf('<span title="Screencast title"><a target=\"_blank\" href="/screencasts/%s">%s</a></span>', row.screencastId, row.title);
}

function channelNameFormatter(value, row) {
  return sprintf('<span title="Channel name"><i class="fa fa-user"/>%s</span>', row.channelName);
}

function durationFormatter(value, row) {
  return sprintf('<span title="Screencast duration"><i class="fa fa-clock-o"/>%s</span>', row.duration);
}

function technologiesFormatter(value, row) {
  var html = '<i class="fa fa-folder-o"/> <a href="/screencasts/tagged/'+ encodeURIComponent(row.technologies[0]) + '" title="Tag 1">%s</a>';
  if (row.technologies[1] != null) {
    html += ' <a href="/screencasts/tagged/' + encodeURIComponent(row.technologies[1]) + '"  title="Tag 2">%s</a>';
  }

  return sprintf(html, htmlEscape(row.technologies[0]), htmlEscape(row.technologies[1]));
}

function showingRowsFormatter (pageFrom, pageTo, totalRows) {
  return sprintf('Showing %s to %s of %s screencasts', pageFrom, pageTo, totalRows);
};

$('table').bootstrapTable({
  formatShowingRows: showingRowsFormatter
});