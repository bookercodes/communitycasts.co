/* globals require, console*/
'use strict'; /* jshint ignore:line*/

var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('processDependencies', function () {
  var sources = [
    './bower_components/angular/angular.min.js',
    './bower_components/angulartics/dist/angulartics.min.js',
    './bower_components/angulartics-google-analytics/dist/angulartics-google-analytics.min.js',
    './bower_components/angular-animate/angular-animate.min.js',
    './bower_components/angular-aria/angular-aria.min.js',
    './bower_components/angular-material/angular-material.min.js',
    './bower_components/angular-ui-router/release/angular-ui-router.min.js',
    './bower_components/angular-messages/angular-messages.min.js',
    './bower_components/ngSmoothScroll/angular-smooth-scroll.min.js',
  ];
  return gulp.src(sources)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('processSass', function() {
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
  .pipe(gulp.dest('./dist'));
});

gulp.task('processJs', function () {
  var sources = [
    './app/config.js',
    './app/app.js',
    './app/**/*.js',
  ];
  return gulp.src(sources)
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['processSass', 'processJs', 'processDependencies']);

gulp.task('run', ['build'], function () {
  gulp.watch('./scss/**/*.scss', ['processSass']);
  gulp.watch('./app/**/*.js', ['processJs']);
  gulp.watch([
    './dist/main.css',
    './dist/main.js',
    '*.html'
  ]).on('change', reload);
  browserSync.init({
    ui: false,
    port: 3001,
    server: {
      baseDir: './'
    },
    notify: false,
    online: true
  });
});
