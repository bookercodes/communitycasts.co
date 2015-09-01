'use strict';

var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');

function initBrowserSync() {
  browserSync.init({
    ui: false,
    port: 3001,
    server: {
      baseDir: './'
    },
    notify: false
  });
}

gulp.task('sass', function() {
  return sass('./scss/main.scss',{
    style:'compressed'
  })
  .on('error', function (err) {
    console.error('Error!', err.message);
  })
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(gulp.dest('./css'));
});

gulp.task('default', ['sass'], function () {
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch([
    './scss/**/*.scss',
    '*.html'
  ]).on('change', reload);
  // gulp.watch('css/main.css').on('change', ['autoprefix']);
  initBrowserSync();
});
