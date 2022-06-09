const { src, dest, watch, series, parallel } = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserSync = require('browser-sync').create();
var replace = require('gulp-replace');

// File paths
const files = { 
    scssPath: 'src/scss/**/*.scss',
    jsPath: 'src/js/**/*.js'
};

// init browser sync
function browserSyncServer(cb){
    browserSync.init({
      server: {
        baseDir: './'
      }    
    });
    cb();
  }

//   reload server
function browsersyncReload(cb){
    browserSync.reload();
    cb();
  }

function scssTask(){    
    return src(files.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass([])) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest('dist')
    ); // put final CSS in dist folder
}

function jsTask(){
    return src([
        files.jsPath
        ])
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(dest('dist')
    );
}

var cbString = new Date().getTime();
function cacheBustTask(){
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

function watchTask(){
    watch([files.scssPath, files.jsPath], 
        parallel(scssTask, jsTask, browsersyncReload));    
}

exports.default = series(
    parallel(scssTask, jsTask), 
    cacheBustTask,
    browserSyncServer,
    watchTask
);