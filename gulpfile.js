const { 
  src, 
  dest, 
  watch, 
  task, 
  series, 
  parallel 
} = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const mocha = require('gulp-mocha');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

task('test', function() {
  return src('test/*.test.js', {read: false})
    .pipe(mocha({
      env: {
        NODE_ENV: true
      },
      reporter: 'spec',
      exit: true
    }));
})

task('typescript', function() {
  return src('src/**/*.ts')
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(dest('build'));
});

task('build', series('typescript'));

task('watch', function() {
  watch([
    'build/**/*.js',
    'test/**/*.test.js'
  ], series('test'))
  
  watch([
    'typings/*.ts',
    'src/**/*.ts'
  ], series('typescript'))
})

task('default', series('typescript', 'watch'))
