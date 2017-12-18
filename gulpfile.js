//"use strict";

// #region DEPENDENCIES
const browserify = require("browserify");
const browserSync = require("browser-sync").create();
const buffer = require("vinyl-buffer");
const gulp = require("gulp");
const istanbul = require("gulp-istanbul");
const mocha = require("gulp-mocha");
const path = require("path");
const source = require("vinyl-source-stream");
const tsc = require("gulp-typescript");
const tsify = require("tsify");
const tslint = require("gulp-tslint");
const runSequence = require("run-sequence");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
// #endregion

// #region CONSTANTS
const tsTestProject = tsc.createProject("tsconfig.json");
const libraryName = "bundle";
const mainTsFilePath = path.join("src", "main.ts");
const outputFolder = "dist";
const buildFolder = "build";
const outputFileName = libraryName + ".min.js";
// #endregion

// #region TASKS
gulp.task(
	"lint",
	() => {
		const config = { formatter: "verbose", emitError: (process.env.CI) ? true : false };

		return gulp
			.src([
				"src/**/**.ts",
				"test/**/**.test.ts"
			])
			.pipe(tslint(config))
			.pipe(tslint.report());
	});

gulp.task("build-test", () => {
	return gulp
		.src([
			"src/**/**.ts",
			"test/**/**.test.ts",
			"typings/main.d.ts/",
			"src/interfaces/interfaces.d.ts"
		])
		.pipe(tsTestProject())
		.on(
		"error",
		(err) => {
			console.error(err);
			process.exit(1);
		})
		.js
		.pipe(gulp.dest(buildFolder));
});

gulp.task("istanbul:hook", () => {
	return gulp.src(["src/**/*.js"])
		// Covering files
		.pipe(istanbul())
		// Force `require` to return covered files
		.pipe(istanbul.hookRequire());
});

gulp.task("copyStatic", () => {
	gulp
		.src("assets/**/*")
		.pipe(gulp.dest(outputFolder));
	gulp
		.src("node_modules/phaser/build/phaser.min.js")
		.pipe(gulp.dest(path.join(outputFolder, "js")));
});

gulp.task("test", ["istanbul:hook"], () => {
	return gulp.src("test/**/*.test.js")
		.pipe(mocha({ ui: "bdd" }))
		.pipe(istanbul.writeReports());
});

gulp.task("build", () => {
	const bundler = browserify({
		debug: true,
		standalone: libraryName
	});

	return bundler
		.add(mainTsFilePath)
		.plugin(tsify, { noImplicitAny: true })
		.bundle()
		.on("error", (error) => { console.error(error.toString()); })
		.pipe(source(outputFileName))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(path.join(outputFolder, "js")));
});

gulp.task("watch", ["default"], () => {
	browserSync.init({
		server: "dist",
		startPath: "/"
	});

	gulp.watch(["src/**/**.ts", "test/**/*.ts"], ["default"]);
	gulp.watch("dist/*.js").on("change", browserSync.reload);
});

gulp.task("default", (cb) => {
	runSequence("lint", /*"build-test", "test",*/ "copyStatic", "build", cb);
});
// #endregion