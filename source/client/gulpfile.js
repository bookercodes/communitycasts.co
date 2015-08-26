var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

function initBrowserSync() {
  browserSync.init({
    ui: false,
    port: 3001,
    server: {
      baseDir: "./"
    },
    notify: false
  });
}

gulp.task('sass', function() {
  return sass('./scss/main.scss')
  .on('error', function (err) {
    console.error('Error!', err.message);
  })
  .pipe(gulp.dest('./css'));
});

gulp.task('default', ['sass'], function () {
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch([
    './scss/**/*.scss',
    '*.html'
  ]).on('change', reload);
  initBrowserSync();
});
