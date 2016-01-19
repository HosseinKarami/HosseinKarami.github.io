var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    cp = require('child_process'),
    package = require('./package.json');

var paths = {
  scripts: ['src/js/scripts.js', 'src/js/material/*.js']
};

var banner = [
  '/*!\n' +
  ' +-------------------------------------+\n' +
  ' * <%= package.name %>                       *\n' +
  ' * <%= package.title %>  *\n' +
  ' * <%= package.url %>            *\n' +
  ' * @author <%= package.author %>  *\n' +
  ' * @version <%= package.version %>                      *\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.       *\n' +
  ' +-------------------------------------+\n' +
  ' */',
  '\n'
].join('');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll.bat', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

gulp.task('css', function () {
    return gulp.src('src/scss/style.scss')
    .pipe(sass({errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('assets/css'))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('assets/css'))
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src(paths.scripts)
    .pipe(header(banner, { package : package }))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(gulp.dest('_site/assets/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', ['css', 'js', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

gulp.task('default', ['css', 'js', 'browser-sync'], function () {
    gulp.watch("src/scss/*/*.scss", ['css']);
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(['*.html', '*/*.html', '_layouts/*.html', '_posts/*', '_includes/*.html'], ['jekyll-rebuild']);
});