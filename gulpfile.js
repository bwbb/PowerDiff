var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var streamqueue = require('streamqueue');
var jswrap = require('gulp-js-wrapper');
var del = require('del');
var runSequence = require('run-sequence');

var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');

var root = 'public/src';
var paths = {
    src: 'public/src',
    build: 'public/www/assets',
    modules: 'node_modules',
    get sassVendor() { return [paths.modules + '/foundation-sites/scss' ] },
    get vendorCss() { return [ paths.modules + '/diff2html/dist/diff2html.min.css'] },
    get appStyles() { return paths.src + '/**/*.scss' },
    get js() { return [ paths.src + '/**/*.js' ]; }
};

var JS_VENDOR_DEPENDENCIES = [
    paths.modules + '/q/q.js',
    paths.modules + '/jquery/dist/jquery.min.js',
    paths.modules + '/foundation-sites/dist/js/foundation.min.js',
    paths.modules + '/foundation-sites/js/foundation.sticky.js'
];

gulp.task('clean', function() {
  return del( [paths.build + '/**/*.js', paths.build + '/**/*.css'] );
});

gulp.task('jsMin', function () {
    return gulp.src( paths.js )
        .pipe( jswrap() )
        .pipe( uglify() )
        .pipe( concat('app.js') )
        .pipe( gulp.dest( paths.build ) );
});

gulp.task('js', function() {
    return gulp.src( paths.js )
        .pipe( jswrap() )
        .pipe( concat('app.js') )
        .pipe( gulp.dest( paths.build ) );
});

gulp.task('vendorJs', function() {
    return gulp.src( JS_VENDOR_DEPENDENCIES )
        .pipe( jswrap() )
        .pipe( concat('vendor.js') )
        .pipe( gulp.dest( paths.build ) );
});

gulp.task('css', function() {
    return streamqueue(
            { objectMode: true },
            gulp.src( paths.appStyles ).pipe( sass({ includePaths : paths.sassVendor, outputStyle: 'compressed' })
                    .on('error', sass.logError)),
            gulp.src( paths.vendorCss )
        )
        .pipe( concat('app.css') )
        .pipe( gulp.dest( paths.build ) );
});

gulp.task( 'build', function() {
    runSequence('clean', ['css', 'vendorJs', 'jsMin'] );
});

gulp.task( 'dev', function() {
    runSequence('clean', [ 'css', 'vendorJs', 'js' ] );
});

gulp.task('watch', function() {
    return gulp.watch( 
        [ paths.js, paths.appStyles ], 
        [ 'dev' ]
    );
});

gulp.task('default', [ 'dev', 'watch' ]);