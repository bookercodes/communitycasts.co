/* globals require, console, process*/
'use strict'; /* jshint ignore:line*/

var gulp = require('gulp');
var runSequence = require('run-sequence');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var gulpNgConfig = require('gulp-ng-config');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('processDependencies', function() {
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
    './bower_components/angular-ui-router-title/angular-ui-router-title.js',
    './bower_components/angular-resource/angular-resource.min.js',
    './bower_components/angular-youtube-mb/dist/angular-youtube-embed.min.js'
  ];
  return gulp.src(sources)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('processConfig', function() {
  return gulp.src('config.json')
    .pipe(gulpNgConfig('config', {
      environment: process.env.NODE_ENV || 'local'
    }))
    .pipe(gulp.dest('./app/'));
});

gulp.task('processSass', function() {
  return sass('./scss/main.scss', {
      style: 'compressed'
    })
    .on('error', function(err) {
      console.error('Error!', err.message);
    })
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('processJs', function() {
  var sources = [
    './app/config.js',
    './app/app.js',
    './app/**/*.js',
  ];
  return gulp.src(sources)
    .pipe(plumber())
    .pipe(concat('main.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('production', function() {
  runSequence(
    'processConfig', ['processSass', 'processJs', 'processDependencies']
  );
});

gulp.task('local', function() {
  runSequence(
    'processConfig', ['processSass', 'processJs', 'processDependencies'],
    function() {
      gulp.watch('./scss/**/*.scss', ['processSass']);
      gulp.watch('./app/**/*.js', ['processJs']);
      gulp.watch([
        './dist/main.css',
        './dist/main.js',
        './**/*.html'
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
});

gulp.task('default', ['local']);
