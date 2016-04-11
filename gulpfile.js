var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var yargs = require('yargs');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();

const PRODUCTION = !!(yargs.argv.production);

// Set sass include paths
var sassIncludePaths = [
    'src/assets/scss/partials',
    'src/assets/scss/modules'
];


gulp.task('default', ['sass', 'serve', 'watch']);

gulp.task('sass', function() {
    return gulp.src('src/assets/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: sassIncludePaths,
            outputStyle: 'expanded',
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(autoprefixer({ browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'] }))
        .pipe(gulpif(PRODUCTION, cssnano()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest('dist/html/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'dist/html',
        open: false,
        reloadOnRestart: true,
        reloadDelay: 100
    });
});

gulp.task('watch', function() {
    gulp.watch('src/assets/scss/**/*.scss', ['sass']);
});