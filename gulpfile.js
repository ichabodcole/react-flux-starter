var gulp        = require('gulp'),
    es          = require('event-stream'),
    del         = require('del'),
    beep        = require('beepbeep'),
    buffer      = require('vinyl-buffer'),
    source      = require('vinyl-source-stream'),
    stylish     = require('jshint-stylish'),
    babelify    = require('babelify'),
    reactify    = require('reactify'),
    browserify  = require('browserify'),
    browserSync = require('browser-sync'),
    proxy       = require('proxy-middleware'),
    path        = require('path'),
    url         = require('url');

var reload = browserSync.reload;
var config = require('./build.config.js');
var $ = require('gulp-load-plugins')();

// Gulp tasks
/**
* @description
* Delete the build & dist folders
*/
function clean(cb) {
    del([
        config.build,
        config.dist
    ], cb);
}

/**
* @description
* Hint the javascript for errors
*/
function jshint() {
    return gulp
        .src(config.js.src)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
        //.pipe($.jshint.reporter('fail'));
}

/**
* @description
* compile the javascript using browserify
*/
function javascript() {
    var bundler = browserify({
        entries: [config.js.entry],
        debug: true
    });

    function bundle () {
        return bundler
            .transform(babelify)
            .transform(reactify)
            .bundle()
            .on('error', handleError)
            .pipe(source(getBundleName() + '.js'))
            //.pipe(buffer())
            .pipe(gulp.dest(config.js.dest))
            .pipe(reload({ stream: true }));
    }

    return bundle();
}

/**
* @description
* Compile the less to css and autoprefix it
*/
function less() {
    return gulp
        .src(config.less.entry)
        .pipe($.less({
            paths: [path.join(__dirname, 'node_modules/bootstrap/less')]
        }))
        .on('error', handleError)
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.less.dest))
        .pipe(reload({ stream: true }));
}

/**
* @description
* Inject the css and javascript into the index file
*/
function inject() {
    var jsFiles  = gulp.src([config.js.dest + '/*.js']),
        cssFiles = gulp.src([config.less.dest + '/*.css']),
        injectStream = es.merge(jsFiles, cssFiles);

    return gulp
        .src(config.index.src)
        .pipe($.inject(injectStream, { ignorePath: ['build'] }))
        .pipe(gulp.dest(config.index.dest));
}

/**
* @description
* Start the browserSync server and serve the build folder
*/
function bSync(done) {

    var proxyOptions = url.parse('http://localhost:1337/api');
    proxyOptions.route = '/api';

    browserSync({
        server: {
            baseDir: config.build,
            middleware: [proxy(proxyOptions)]
        },
        //proxy: 'localhost:1337',
        notify: false,
        open: true
    }, done);
}

/**
* @description
* Watch less, javascript, and the html index file for changes
*/
function watch() {
    gulp.watch([config.less.src], less);
    gulp.watch([config.js.src], gulp.series(jshint, javascript, reload));
    gulp.watch([config.index.src], gulp.series(inject, reload));
}

gulp.task('build', gulp.series(clean, jshint, gulp.parallel(javascript, less), inject));
gulp.task('serve', gulp.series('build', gulp.parallel(bSync, watch)));


// Utility Functions
function handleError(err) {
    beep([0, 0, 0]);
    console.error(err.toString());
    process.stdout.write('\x07');
    this.emit('end');
}

function getBundleName() {
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return name + '.' + version;
}
