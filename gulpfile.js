const gulp = require('gulp');
const sass = require('gulp-sass');
const browsersync = require('browser-sync');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const cleancss = require('gulp-clean-css');
const rigger = require('gulp-rigger');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const rimraf = require('rimraf');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');

const path = {
  build: { // Тут мы укажем куда складывать готовые после сборки файлы
    html: 'build/',
    js: 'build/assets/js/',
    css: 'build/assets/css/',
    img: 'build/assets/images/',
    fonts: 'build/assets/fonts/',
  },
  src: { // Пути откуда брать исходники
    html: 'src/html/templates/*.html', // Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: {
      vendor: 'src/vendor_entries/vendor.js',
      main: 'src/js/app.js',
    },
    style: {
      vendor: 'src/vendor_entries/vendor.scss',
      main: 'src/scss/styles.scss',
    },
    img: 'src/images/**/*.*', // Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*',
  },
  watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    style: 'src/scss/**/*.scss',
    img: 'src/images/**/*.*',
    fonts: 'src/fonts/**/*.*',
  },
  clean: './build',
};

const config = {
  server: {
    baseDir: './build',
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'Symonov',
};

gulp.task('html', (done) => {
  return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('vendor_styles', (done) => {
  return gulp.src(path.src.style.vendor)
    .pipe(sass({ outputStyle: 'nested' }).on('error', notify.onError()))
    .pipe(rename('vendor.min.css'))
    .pipe(cleancss({ level: { 2: { specialComments: 0 } } }))
    .pipe(gulp.dest(path.build.css))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('main_styles', (done) => {
  return gulp.src(path.src.style.main)
    .pipe(sass({ outputStyle: 'nested' }).on('error', notify.onError()))
    .pipe(autoprefixer())
    .pipe(cleancss({ level: { 2: { specialComments: 0 } } }))
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest(path.build.css))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('vendor_js', (done) => {
  return gulp.src(path.src.js.vendor)
    .pipe(babel())
    .pipe(rigger())
    .pipe(rename('vendor.min.js'))
    .pipe(uglify({
      toplevel: true,
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('main_js', (done) => {
  return gulp.src(path.src.js.main)
    .pipe(babel())
    .pipe(rigger())
    .pipe(rename('app.min.js'))
  // .pipe(uglify({
  //   toplevel: true,
  // }))
    .pipe(gulp.dest(path.build.js))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('image', (done) => {
  return gulp.src(path.src.img)
    .pipe(imagemin([imageminMozjpeg({
      quality: 85,
    })]))
    .pipe(gulp.dest(path.build.img))
    .pipe(browsersync.reload({ stream: true }));
  done();
});

gulp.task('fonts', (done) => {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
  done();
});

gulp.task('build', gulp.series('html', 'vendor_js', 'main_js', 'vendor_styles', 'main_styles', 'fonts', 'image'));

gulp.task('watch', (done) => {
  gulp.watch([path.watch.html], gulp.parallel(['html']));
  gulp.watch([path.watch.js], gulp.parallel(['vendor_js', 'main_js']));
  gulp.watch([path.watch.style], gulp.parallel(['vendor_styles', 'main_styles']));
  gulp.watch([path.watch.fonts], gulp.parallel(['fonts']));
  gulp.watch([path.watch.img], gulp.parallel(['image']));
  done();
});

gulp.task('webserver', (done) => {
  browsersync(config);
  done();
});

gulp.task('default', gulp.series('build', 'webserver', 'watch'));

gulp.task('clean', (cb) => {
  rimraf(path.clean, cb);
});
