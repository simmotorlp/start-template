'use strict';

var gulp = require( 'gulp' ),
	gutil = require( 'gulp-util' ),
	sass = require( 'gulp-sass' ),
	browsersync = require( 'browser-sync' ),
	concat = require( 'gulp-concat' ),
	uglify = require( 'gulp-uglify' ),
	cleancss = require( 'gulp-clean-css' ),
    	sourcemaps = require('gulp-sourcemaps'),
	rigger = require( 'gulp-rigger' ),
	rename = require( 'gulp-rename' ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	rimraf = require( 'rimraf' ),
	notify = require( "gulp-notify" ),
	rsync = require( 'gulp-rsync' );

var path = {
	build : { //Тут мы укажем куда складывать готовые после сборки файлы
		html : 'build/',
		js : 'build/js/',
		css : 'build/css/',
		img : 'build/img/',
		fonts : 'build/fonts/'
	},
	src : { //Пути откуда брать исходники
		html : 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js : 'src/js/scripts.js',//В стилях и скриптах нам понадобятся только main файлы
		style : 'src/sass/main.sass',
		img : 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		fonts : 'src/fonts/**/*.*'
	},
	watch : { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html : 'src/**/*.html',
		js : 'src/js/**/*.js',
		style : 'src/sass/**/*.sass',
		img : 'src/img/**/*.*',
		fonts : 'src/fonts/**/*.*'
	},
	clean : './build'
};

var config = {
	server : {
		baseDir : "./build"
	},
	tunnel : false,
	host : 'localhost',
	port : 9000,
	logPrefix : "Symonov"
};

gulp.task( 'html', function(done) {
	gulp.src( path.src.html ) //Выберем файлы по нужному пути
		.pipe( rigger() ) //Прогоним через rigger
		.pipe( gulp.dest( path.build.html ) ) //Выплюнем их в папку build
		.pipe( browsersync.reload( { stream : true } ) ) //И перезагрузим наш сервер для обновлений
	done();
} );

gulp.task( 'styles', function(done) {
	return gulp.src( path.src.style )
		.pipe( sourcemaps.init() )
		.pipe( sass( { outputStyle : 'expand' } ).on( "error", notify.onError() ) )
		.pipe( sourcemaps.write('.') )
		.pipe( rename( 'style.css' ) )
		.pipe( autoprefixer( [ 'last 15 versions' ] ) )
		.pipe( cleancss( { level : { 0 : { specialComments : 0 } } } ) ) // Opt., comment out when debugging
		.pipe( gulp.dest( path.build.css ) )
		.pipe( browsersync.reload( { stream : true } ) )
	done();
} );

gulp.task( 'js', function(done) {
	return gulp.src( path.src.js )
		.pipe( rigger() ) //Прогоним через rigger
		// .pipe(uglify()) // Mifify js (opt.)
		.pipe( gulp.dest( path.build.js ) )
		.pipe( browsersync.reload( { stream : true } ) )
	done();
} );

gulp.task( 'image', function(done) {
	gulp.src( path.src.img ) //Выберем наши картинки
		.pipe( gulp.dest( path.build.img ) ) //И бросим в build
		.pipe( browsersync.reload( { stream : true } ) )
	done();
} );

gulp.task( 'fonts', function(done) {
	gulp.src( path.src.fonts )
		.pipe( gulp.dest( path.build.fonts ) )
	done();
} );

gulp.task( 'rsync', function(done) {
	return gulp.src( 'src/**' )
		.pipe( rsync( {
			root : 'src/',
			hostname : 'username@yousite.com',
			destination : 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude : [ '**/Thumbs.db', '**/*.DS_Store' ], // Excludes files from deploy
			recursive : true,
			archive : true,
			silent : false,
			compress : true
		} ) )
	done();
} );

gulp.task( 'build', gulp.series( 'html', 'js', 'styles', 'fonts', 'image' ));

gulp.task( 'watch', function(done) {
	gulp.watch( [ path.watch.html ], gulp.parallel([ 'html' ] ));
	gulp.watch( [ path.watch.js ], gulp.parallel([ 'js' ] ));
	gulp.watch( [ path.watch.style ], gulp.parallel([ 'styles' ] ));
	gulp.watch( [ path.watch.fonts ], gulp.parallel([ 'fonts' ] ));
	gulp.watch( [ path.watch.img ], gulp.parallel([ 'image' ] ));
	done();
} );

gulp.task( 'webserver', function(done) {
	browsersync( config );
	done();
} );

gulp.task( 'default', gulp.series( 'build', 'webserver', 'watch' ));

gulp.task( 'clean', function( cb ) {
	rimraf( path.clean, cb );
} );
