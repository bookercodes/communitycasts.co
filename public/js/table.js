String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

function titleFormatter(value, row) {
  return "<a target=\"_blank\" href='/videos/{videoId}'>{title}</a>".supplant(row);
}

function channelNameFormatter(value, row) {
  return "<i class='fa fa-user'/>{channelName}".supplant(row);
}

function durationFormatter(value, row) {
  return "<i class='fa fa-clock-o'/>{duration}".supplant(row);
}

function technologiesFormatter(value, row) {
  var html = "<i class='fa fa-folder-o'/> <a href='/technologies/"+ encodeURIComponent(row.technologies[0]) + "'>{technology1}</a>";
  if (row.technologies[1] != null)
    html += " <a href='technologies/" + encodeURIComponent(row.technologies[0]) +"'>{technology2}</a>";
  return html.supplant({
    technology1: row.technologies[0],
    technology2: row.technologies[1],
  });
}