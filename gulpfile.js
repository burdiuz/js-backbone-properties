/**
 * Created by Oleg Galaburda on 26.12.15.
 */
var gulp = require("gulp"),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename"),
  include = require("gulp-include");

gulp.task('build', function() {
  gulp.src('source/backbone-properties-umd.js')
    // create concatenated file
    .pipe(include())
    .on('error', console.log)
    .pipe(rename('backbone-properties.js'))
    .pipe(gulp.dest('dist'))
    // create minified version
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);
