var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

function initBrowserSync() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    notify: false
  });
}

gulp.task('serve', function () {
  gulp.watch([
    '*.html'
  ]).on('change', reload);
  initBrowserSync();
});
