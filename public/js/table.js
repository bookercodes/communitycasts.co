String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

function titleFormatter(value, row) {
  return "<span title='Screencast title'><a target=\"_blank\" href='/screencasts/{screencastId}'>{title}</a></span>".supplant(row);
}

function channelNameFormatter(value, row) {
  return "<span title='Channel name'><i class='fa fa-user'/>{channelName}</span>".supplant(row);
}

function durationFormatter(value, row) {
  return "<span title='Screencast duration'><i class='fa fa-clock-o'/>{duration}</span>".supplant(row);
}

function technologiesFormatter(value, row) {
  var html = "<i class='fa fa-folder-o'/> <a href='/screencasts/tagged/"+ encodeURIComponent(row.technologies[0]) + "' title='Tag 1'>{technology1}</a>";
  if (row.technologies[1] != null)
    html += " <a href='technologies/screencasts/tagged/" + encodeURIComponent(row.technologies[0]) +"'  title='Tag 2'>{technology2}</a>";
  return html.supplant({
    technology1: row.technologies[0],
    technology2: row.technologies[1],
  });
}