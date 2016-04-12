var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var yargs = require('yargs');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var rimraf = require('rimraf');

const PRODUCTION = !!(yargs.argv.production);

// Set sass include paths
var sassIncludePaths = [
    'src/assets/scss/partials',
    'src/assets/scss/modules'
];

// Set source paths
var src = {
    path: 'src/',
    assetsDir: 'src/assets/',
    dataDir: 'src/data',
    scripts: 'src/assets/js/**/*.js',
    images: 'src/assets/img/**/*',
    sass: 'src/assets/scss/**/*.scss',
    data: 'src/data/*.json',
    templates: 'src/templates/*.html',
    templatesAndPartials: 'src/templates/**/*.html'
}

// Set distribution paths
var dist = {
    path: 'dist/',
    htmlDir: 'dist/html',
    assetsDir: 'dist/html/assets',
    scriptsDir: 'dist/html/assets/js',
    imagesDir: 'dist/html/assets/img',
    cssDir: 'dist/html/assets/css',
    templates: 'dist/html/*.html'
}

// Task runners
// ---------------------------------------------------------------------

gulp.task('build', function(cb) {
    runSequence('clean-assets', ['copy-assets', 'sass'], cb);
});

gulp.task('default', function(cb) {
    runSequence('build', 'serve', 'watch', cb);
});



// Individual Tasks
// ---------------------------------------------------------------------

gulp.task('clean-assets', function(done){
    rimraf(dist.assetsDir + '/**/*', done);
});


// Copy assets to distribution folder
gulp.task('copy-assets', function(){
    return gulp.src(['src/assets/**/*', '!src/assets/{img,js,scss}/**/*', '!src/assets/scss'])
      .pipe(gulp.dest(dist.assetsDir));
});


// Sass
gulp.task('sass', function() {
    return gulp.src(src.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: sassIncludePaths,
            outputStyle: 'expanded',
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(autoprefixer({ browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'] }))
        .pipe(gulpif(PRODUCTION, cssnano()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest(dist.cssDir))
        .pipe(browserSync.stream());
});


// Browsersync server
gulp.task('serve', function() {
    browserSync.init({
        server: dist.htmlDir,
        open: false,
        reloadOnRestart: true,
        reloadDelay: 100
    });
});

gulp.task('watch', function() {
    gulp.watch(dist.sass, ['sass']);
});