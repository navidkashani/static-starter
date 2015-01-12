/*
 * Start Config Gulp 
 * Load Plugins
 */
var gulp   = require('gulp');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var cp = require('child_process');
var browserSync = require('browser-sync');
var mainBowerFiles = require('main-bower-files');
var loadjekyll  = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

var vendor  = require('./gulp/vendor').vendor;

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Directories
var appURL = 'app'
var assetsURL = appURL + '/assets';

/**
 * Gulp Tasks
 */

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll:build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(loadjekyll, ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll:rebuild', ['jekyll:build'], function () {
    browserSync.reload();
});


/**
 * Wait for jekyll:build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'js', 'jekyll:build'], function() {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src(assetsURL + '/scss/style.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
		//.pipe(minifyCSS())
        .pipe(gulp.dest(assetsURL + '/css'));
});

/**
 * concatenate and minify JS files and save it to assets/js folder.
 */
gulp.task('js', function() {
  gulp.src(vendor.js)
    .pipe(concat('all.js'))
    .pipe(gulp.dest(assetsURL + '/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(assetsURL + '/js'))
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(assetsURL + '/scss/**/*.scss', ['sass', 'jekyll:rebuild']);
    gulp.watch([appURL + '/**/*.{html,markdown,md}', '!' + assetsURL + '/**/*'], ['jekyll:rebuild']);
    gulp.watch(assetsURL + '/js/app.js', ['js', 'jekyll:rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);

/**
 * Copy Main Files from bower_components to assets/vendor folder.
 */
gulp.task('vendor', function() {
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(gulp.dest(assetsURL + '/vendor'))
});

/**
 * Copy Foundation Setting File from vendor to assets/scss/settings.
 */
gulp.task('copy:foundation', function() {
  var fs = require('fs');
  if (fs.existsSync(assetsURL + '/scss/settings/_foundation-settings.scss')) {
    console.log('Foundation Settings File Exist!')
  } else {
    console.log('Copy Foundation Settings File to Settings Folder.');
	gulp.src(assetsURL + '/vendor/foundation/scss/foundation/_settings.scss')
		.pipe(rename('_foundation-settings.scss'))
		.pipe(gulp.dest(assetsURL + '/scss/settings'));
  }
});

/**
 * Start Your New Project with this task (only once).
 */
gulp.task('start', ['vendor', 'copy:foundation', 'default']);