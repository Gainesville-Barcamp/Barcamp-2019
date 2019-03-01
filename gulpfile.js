/**
 * Paths to project folders
 */

var paths = {
	input: 'src/',
	output: 'dist/',
	scripts: {
		input: 'src/js/*',
		output: 'dist/assets/js/'
	},
	styles: {
		input: 'src/sass/**/*.{scss,sass}',
		output: 'dist/assets/css/'
	},
	images: {
		input: 'src/images/*',
		output: 'dist/assets/images/'
	},
	views: {
		input: 'src/views/**/*',
		output: 'dist/'
	},
	reload: './dist/'
};

var { gulp, src, dest, watch, series, parallel} = require('gulp');
var del = require("del");
var rename = require("gulp-rename");
var newer = require("gulp-newer");
var fileinclude = require('gulp-file-include');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

//Styles
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-cssnano');

//Images
var imagemin = require("gulp-imagemin");

// BrowserSync
var browserSync = require('browser-sync');

// Remove pre-existing content from output folders
var cleanDist = function(done) {
	del.sync([
		paths.output
	]);
	done();
};

// Process, lint, and, minify Sass files
var processStyles = function(done) {
	src(paths.styles.input)
		.pipe(sass({
			outputStyle: 'expanded',
			sourceComments: true
		}))
		.pipe(prefix({
			browsers: ['last 2 version', '> 0.25%'],
			cascade: true,
			remove: true
		}))
		.pipe(dest(paths.styles.output))
		.pipe(rename({suffix: '.min'}))
		.pipe(minify({
			discardComments: {
				removeAll: true
			}
		}))
		.pipe(dest(paths.styles.output));
	done();
};

// Optimize Images
var processImages = function(done) {
  src(paths.images.input)
  .pipe(newer(paths.images.output))
  .pipe(imagemin({
    interlaced: true,
    progressive: true,
    optimizationLevel: 5,
    svgoPlugins: [
      {
        removeViewBox: true
      }
    ]
  }))
  .pipe(dest(paths.images.output));
  done();
};

//Minify, and concatenate scripts
var processScripts = function(done) {
  src(paths.scripts.input)
    .pipe(concat('application.js'))
    .pipe(dest(paths.scripts.output))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(dest(paths.scripts.output));
    done();
};

//Process partials, copy views
var processPartials = function(done) {
  src('./src/views/*.tpl.html')
  .pipe(fileinclude({ prefix: '@@'}))
  .pipe(rename({ extname: "" }))
  .pipe(rename({ extname: ".html" }))
  .pipe(dest(paths.views.output));
  done();
};

// Watch for changes to the src directory
var startServer = function(done) {
	browserSync.init({
		server: {
			baseDir: paths.reload
		}
	});
	done();
};

// Reload the browser when files change
var reloadBrowser = function(done) {
	browserSync.reload();
	done();
};

// Watch for changes
var watchSource = function(done) {
	watch(paths.input, series(exports.build, reloadBrowser));
	done();
};


//Process partials, copy views
var processPartials = function(done) {
  src('./src/views/*.tpl.html')
  .pipe(fileinclude({ prefix: '@@'}))
  .pipe(rename({ extname: "" }))
  .pipe(rename({ extname: ".html" }))
  .pipe(dest(paths.views.output));
  done();
};

var deploy = function(done) {
	console.log('deploying');
	src('./dist/**/*').pipe(ghPages());
	done();
};

// build task

exports.build = series(
	cleanDist,
	parallel(
    processStyles,
    processImages,
    processScripts,
    processPartials
	)
);

// Watch and reload

exports.watch = series(
	exports.build,
	startServer,
	watchSource
);
