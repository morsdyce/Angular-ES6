'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gutil = require('gulp-util');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass({errLogToConsole: true}))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/styles'))
        .pipe(reload({stream:true}))
        .pipe($.size());
});

gulp.task('jshint', function () {
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('traceur', function () {
    var runtimePath = $.traceur.RUNTIME_PATH;
    var filter = $.filter('!traceur-runtime.js');

    return gulp.src([runtimePath, 'app/scripts/**/*.js'])
        .pipe($.order([
            'traceur-runtime.js',
            '**/*.js',
            'Home/home.ctrl.js',
            'app.js'
        ]))
        .pipe(filter)
        .pipe($.traceur({
            experimental: true,
            // sourceMap: true,
            modules: 'register'
        }))
        .pipe(filter.restore())
        .pipe($.concat('app.js'))
        .pipe($.insert.append('System.get("app" + "");'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.notify("Compilation complete."));
});

gulp.task('copy_angular_templates', function() {
    gulp.src(["app/**/*.tpl.html"], {base: "."})
        .pipe(gulp.dest("dist/"));
});

gulp.task('html', ['styles'], function () {
    var cssFilter = $.filter('**/*.css');

    return gulp.src('app/*.html')
        .pipe($.useref.assets())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(reload({stream:true, once:true}))
        .pipe($.size());
});

gulp.task('fonts', function () {
    var streamqueue = require('streamqueue');
    return streamqueue({objectMode: true},
        $.bowerFiles(),
        gulp.src('app/fonts/**/*')
    )
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('clean', function () {
    return gulp.src(['app/styles/main.css', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'jshint', 'traceur', 'copy_angular_templates']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('serve', ['styles', 'build'], function () {
    browserSync.init(null, {
        server: {
            baseDir: 'dist',
            directory: true
        },
        debugInfo: false,
        open: false,
        hostnameSuffix: ".xip.io"
    }, function (err, bs) {
        require('opn')(bs.options.url);
        console.log('Started connect web server on ' + bs.options.url);
    });
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));
    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            exclude: ['bootstrap-sass-official']
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['build', 'serve'], function () {
 
    // watch for changes
    gulp.watch(['app/*.html'], reload);
    gulp.watch(['app/**/*.tpl.html'], ['copy_angular_templates']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch(['app/scripts/**/*.js'], ['traceur']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
