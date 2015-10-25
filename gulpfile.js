/// <binding AfterBuild='deploy' />
var gulp = require('gulp');
var template = require('gulp-template');
var nodemon = require('gulp-nodemon');
var path = require('path');
var rootToServer = './server/server.js';
gulp.task('default', function () {
});
    //here begins my gulp journey
    //my first thought was to just get gulp to start node
    //so i will be using gulp-nodemon to configure that

    //  Task || Node Server Start 

    gulp.task('start', function () {
        nodemon({
            script: rootToServer
        , ext: 'js html'
        , env: { 'NODE_ENV': 'development' }
        })
    })

// resolve dependencies

    var resolveDependencies = require('gulp-resolve-dependencies');
    var concat = require('gulp-concat');

    gulp.task('js', function () {
        gulp.src(['app/assets/js/main.js'])
          .pipe(resolveDependencies({
              pattern: /\* @requires [\s-]*(.*\.js)/g
          }))
              .on('error', function (err) {
                  console.log(err.message);
              })
          .pipe(concat())
          .pipe(gulp.dest('dest/assets/js/'));
    });

//Broserify

    var browserify = require('browserify'); 
    var source = require('vinyl-source-stream');

    gulp.task('browserify', function () {
        return browserify('./app.js')
            .bundle()
            //Pass desired output filename to vinyl-source-stream
            .pipe(source('bundle.js'))
            // Start piping stream to tasks!
            .pipe(gulp.dest('./build/'));
    });

// deploy readme to gh pages


    var ghPages = require('gulp-gh-pages');

    gulp.task('deploy', function () {
        return gulp.src('./dist/**/*')
          .pipe(ghPages());
    });
    var manifest = require('gulp-manifest');
    gulp.task('manifest', function () {
        gulp.src(['./*'], { base: '/../../' })
          .pipe(manifest({
              hash: true,
              preferOnline: true,
              network: ['*'],
              filename: 'app.manifest',
              exclude: 'app.manifest'
          }))
          .pipe(gulp.dest('build'));
    });
    var clean = require('gulp-clean');    
    var gzip = require('gzip');

    var config = {
        threshold: '1kb'
    };

    gulp.task('clean', function() {
        gulp.src('tmp', { read: false })
          .pipe(clean());
    });

    gulp.task('small', function() {
        gulp.src('./build/app.manifest')
          .pipe(gzip(config))
          .pipe(gulp.dest('tmp'));
    });

    gulp.task('big', function() {
        gulp.src('./build/bundle.js')
          .pipe(gzip(config))
          .pipe(gulp.dest('tmp'));
    });

    //gulp.task('large', function() {
    //    gulp.src('../files/large.txt', { buffer: false })
    //      .pipe(gzip(config))
    //      .pipe(gulp.dest('tmp'));
    //});

    //gulp.task('default', ['clean', 'small', 'big', 'large']);


//create the file watcher for cache manifest files
    var plumber = require('gulp-plumber');
    var through = require('through');
    gulp.task('watch', function () {
        saneWatch('./build/.manifest', function () {
            gulp.start('clean');
        });
    });
    var notify = require("gulp-notify");
    gulp.src("./build/bundle.js")
      .pipe(notify({
          "icon": path.join(__dirname, "Untitled-53.png"), // case sensitive
      }));

gulp.src("./build/*")
          .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
          .pipe(through(function () {
              this.emit("error", new Error("Something happend: Error message!"))
          }));
gulp.task("advanced", function () {
    return gulp.src("./public/*")
        .pipe(notify({
            "title": "Open Github",
            "subtitle": "Project web site",
            "message": "Click to open project site",
            "sound": "Frog", // case sensitive
            "icon": path.join(__dirname, "Untitled-53.png"), // case sensitive
            "onLast": true,
            "wait": true
        }));
});

module.exports = gulp;