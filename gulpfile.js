"use strict";

/*************************************
 * Plugins section
 ************************************/

const gulp = require("gulp"),
    terser = require("gulp-terser"),
    sass = require("gulp-sass")(require("node-sass")),
    htmlmin = require("gulp-htmlmin"),
    rimraf = require("rimraf"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

/*************************************
 * Parameters section
 ************************************/

const path = {
        build: {
            // пути для сборки проекта
            html: "build",
            css: "build/css",
            scss: "build/css",
            js: "build/js",
            img: "build/img",
        },
        src: {
            // пути размещения исходных файлов проекта
            html: "src/*.{html,htm}",
            css: "src/*.css",
            scss: "src/scss/**/*.scss",
            js: "src/js/*.js",
            img: "img/*.{svg,jpg,jpeg,png,gif,ico}",
        },
        watch: {
            // пути файлов, за изменением которых мы хотим наблюдать
            html: "src/*.{html,htm}",
            css: "src/*.css",
            scss: "src/scss/**/*.scss",
            js: "src/js/*.js",
        },
        clean: "build", // путь очистки директории для сборки
    },
    config = {
        server: {
            baseDir: "build/", // base directory
            index: "index.html", // start page
        },
        tunnel: true, // tunnel
        //proxy: 'donate.local', // for php and xampp vhosts
        host: "localhost",
        port: 7787,
        logPrefix: "WebDev",
    };

/***********************
 * Tasks
 ***********************/

// Очищаем папку директории сборки
gulp.task("clean", function (done) {
    rimraf(path.clean, done);
});

// Минимифицируем html и помещаем в папку для сборки
gulp.task("build:html", function (done) {
    gulp.src(path.src.html)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true })); // browser-sync
    done();
});

// Копируем CSS файлы в папку для сборки
gulp.task("mv:css", function (done) {
    gulp.src(path.src.css)
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({ stream: true }));
    done();
});

// Минифицируем JS и помещаем в папку для сборки
gulp.task("mv:js", function (done) {
    gulp.src(path.src.js)
        .pipe(terser())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
    done();
});

// Копируем IMG файлы в папку для сборки
gulp.task("mv:img", function (done) {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
    done();
});

// Develop
// Собираем SASS файлы и помещаем в папку сборки (с .map файлами)
gulp.task("dev:scss", function (done) {
    gulp.src(path.src.scss, { sourcemaps: true })
        .pipe(
            sass({
                outputStyle: "compressed",
                sourcemaps: false,
            })
        )
        .pipe(gulp.dest(path.build.scss, { sourcemaps: "." }))
        .pipe(reload({ stream: true }));
    done();
});

// Production
// Собираем SASS файлы и помещаем в папку сборки (без .map файлов)
gulp.task("prod:scss", function (done) {
    gulp.src(path.src.scss)
        .pipe(
            sass({
                outputStyle: "compressed",
                sourcemaps: false,
            })
        )
        .pipe(gulp.dest(path.build.scss));
    done();
});

/***********************
 * Run watchers & webserver
 ***********************/

// Запуск отслеживания изменения файлов
gulp.task("watch", function (done) {
    gulp.watch(path.watch.html, gulp.series("build:html"));
    gulp.watch(path.watch.scss, gulp.series("dev:scss"));
    gulp.watch(path.watch.js, gulp.series("mv:js"));
    done();
});

// Запуск сервера
gulp.task("webserver", function (done) {
    browserSync(config);
    done();
});

// Сборка под разработку с запуском сервера
gulp.task(
    "dev",
    gulp.series(
        "clean",
        gulp.parallel("build:html", "dev:scss", "mv:js", "mv:img"),
        "watch",
        "webserver"
    )
);

// Сборка по умолчанию под продакшен
gulp.task(
    "default",
    gulp.series(
        "clean",
        gulp.parallel(
            "build:html",
            "mv:img",
            "prod:scss",
            "mv:js"
        )
    )
);
