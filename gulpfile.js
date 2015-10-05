var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

gulp.task('mocha', function() {
    return gulp.src(['spec/**/*.spec.js'], { read: false })
        .pipe(mocha({ reporter: 'list', require: ['./spec/helpers/chai.js'] }))
        .on('error', gutil.log);
});


gulp.task('watch-mocha', function() {
    gulp.watch(['lib/**', 'spec/**'], ['mocha']);
});
