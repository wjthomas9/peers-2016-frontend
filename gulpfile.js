var gulp =          require('gulp');
var sass =          require('gulp-sass');
var autoprefixer =  require('gulp-autoprefixer');
var cssnano =       require('gulp-cssnano');
var sourcemaps =    require('gulp-sourcemaps');
var gulpif =        require('gulp-if');
var yargs =         require('yargs');
var watch =         require('gulp-watch');
var browserSync =   require('browser-sync').create();
var runSequence =   require('run-sequence');
var rimraf =        require('rimraf');
var twig =          require('gulp-twig');
var imagemin =      require('gulp-imagemin');
var data =          require('gulp-data');
var fs =            require('fs');
var include =       require('gulp-include');
var uglify =        require('gulp-uglify');
var prettify =      require('gulp-prettify');
var rev =           require('gulp-rev');
var revReplace =    require('gulp-rev-replace');

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

gulp.task('clean', function(cb) {
    runSequence(['clean-assets', 'clean-templates'], cb);
});

gulp.task('build', function(cb) {
    runSequence('clean', ['scripts', 'sass', 'images', 'templates'],
        'copy-assets', 'revassets', 'replace-urls', 'prettify-templates', cb);
});

gulp.task('default', function(cb) {
    runSequence('build', 'serve', 'watch', cb);
});



// Individual Tasks
// ---------------------------------------------------------------------

gulp.task('clean-assets', function(done){
    rimraf(dist.assetsDir + '/**/*', done);
});

gulp.task('clean-templates', function(done){
    rimraf(dist.templates, done);
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


//Create JSON data to pass to twig
function getData(file) {
    var data = {};
    data.quotes = JSON.parse(fs.readFileSync(file));
    return data;
}


// Templates
gulp.task('templates', function() {
    return gulp.src(src.templates)
        .pipe(data(getData('./src/data/surveyQuotes.json')))
        .pipe(twig())
        .pipe(gulp.dest(dist.htmlDir))
        .pipe(browserSync.stream());
});



//Optimize Images
gulp.task('images', function() {
    return gulp.src(src.images)
      .pipe(gulpif(PRODUCTION, imagemin({
        progressive: true
      })))
      .pipe(gulp.dest(dist.imagesDir));
});



//Compile JS
gulp.task('scripts', function() {
    return gulp.src(src.assetsDir + 'js/main.js')
        .pipe(include())
        .pipe(sourcemaps.init())
        .pipe(gulpif(PRODUCTION, uglify()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest(dist.scriptsDir))
        .pipe(browserSync.stream());
});


// Prettify HTML Templates
gulp.task('prettify-templates', function() {
    return gulp.src([
        dist.htmlDir + '/*.html'
        ], { base: dist.htmlDir })
        .pipe(gulpif(PRODUCTION, prettify({
            indent_with_tabs: true,
            preserve_newlines: true,
            unformatted: ['pre', 'code', 'script']
        })))
        .pipe(gulpif(PRODUCTION, gulp.dest(dist.htmlDir)));
});


// Cache busting
gulp.task('revassets', function() {
    return gulp.src([dist.cssDir + '/*.css', dist.scriptsDir + '/*.js'], { base: dist.assetsDir })
        .pipe(gulpif(PRODUCTION, rev()))
        .pipe(gulpif(PRODUCTION, gulp.dest(dist.assetsDir)))
        .pipe(gulpif(PRODUCTION, rev.manifest()))
        .pipe(gulpif(PRODUCTION, gulp.dest(dist.assetsDir)));
});

var revmanifest = gulp.src('./' + dist.assetsDir + '/rev-manifest.json');

gulp.task('replace-urls', function() {
    return gulp.src(dist.htmlDir + '/*.html')
        .pipe(gulpif(PRODUCTION, revReplace({
            manifest: revmanifest
        })))
        .pipe(gulpif(PRODUCTION, gulp.dest(dist.htmlDir)));
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
    gulp.watch(src.sass, ['sass']);
    gulp.watch(src.scripts, ['scripts']);
    gulp.watch(src.data, ['templates']);
    gulp.watch(src.templatesAndPartials, ['templates']);
});