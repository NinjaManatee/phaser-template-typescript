//"use strict";

// #region Dependencies
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
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
// #endregion

// #region Constants
const tsConfig = tsc.createProject("tsconfig.json");
const libraryName = "bundle";
const mainTsFilePath = path.join("src", "main.ts");
const outputFolder = "dist";
const buildFolder = "build";
const outputFileName = libraryName + ".min.js";
// #endregion

// #region Tasks
gulp.task(
	"lint",
	() => {
		const config = {
			formatter: "verbose",
			emitError: (process.env.CI) ? true : false
		};

		return gulp
			.src([
				"src/**/*.ts",
				"test/**/*.test.ts"
			])
			.pipe(tslint(config))
			.pipe(tslint.report());
	});

gulp.task("build-test", ["lint"], () => {
	return gulp
		.src([
			"src/**/*.ts",
			"test/**/*.test.ts"
		], {
			base: "./"
		})
		.pipe(tsConfig())
		.on("error",
		(err) => {
			console.error(err);
			process.exit(1);
		})
		.js
		.pipe(gulp.dest(buildFolder));
});

gulp.task("istanbul:hook", () => {
	return gulp.src(["build/**/*.js"])
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

gulp.task(
	"test",
	[
		"build-test",
		"istanbul:hook"
	], () => {
		return gulp
			.src("build/test/**/*.test.js")
			.pipe(mocha({ ui: "bdd" }))
			.pipe(istanbul.writeReports());
	});

gulp.task(
	"build",
	[
		"copyStatic"
	], () => {
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
	browserSync
		.init({
			server: outputFolder,
			startPath: "/"
		});

	gulp
		.watch(
		[
			"src/**/**.ts",
			"test/**/*.ts"
		],
		[
			"default"
		]);

	gulp
		.watch("dist/**/*")
		.on("change", browserSync.reload);
});

gulp.task("default", ["test"]);
// #endregion