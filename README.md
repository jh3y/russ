[![NPM](https://nodei.co/npm/russ.png?downloads=true)](https://nodei.co/npm/russ/)

[![Build Status](https://travis-ci.org/jh3y/russ.svg?branch=master)](https://travis-ci.org/jh3y/russ)
![img](https://img.shields.io/badge/version-0.9.0-000000.svg)
![img](https://img.shields.io/badge/language-JS-9a12b3.svg)
![img](https://img.shields.io/badge/license-MIT-22a7f0.svg)

![alt tag](https://raw.github.com/jh3y/pics/master/russ/russ-sm.png)

russ - _a node script runner_
===
```shell
$ russ compile
[russ] Running compile
[russ] Finished compile in 1.27s
```
```javascript
module.exports = {
  name: 'compile',
  doc : 'Compile sources',
  deps: [
    'some-module'
  ],
  func: (someModule, russ) => {
    someModule.compile(russ.config.sources.scripts);
    setTimeout(russ.resolve);
  }
}
```
`russ` is a result of my personal exploration of different methods for task running

* No specific ecosystem so no outdated dependencies
* Self documented tasks for newcomers simply by running `russ`
* No `package.json` bloat or misleading `Makefile`
* Run tasks in sequence or concurrently
* Pre and post hooks for tasks
* Just uses node
* Profiles running time of tasks
* Just does what you tell it

# Index
1. [Why create Russ?](#why-create-russ)
2. [Setup](#setup)
3. [Usage](#usage)
  1. [Basic CLI](#basic-cli-usage)
  2. [Defining tasks](#defining-tasks)
    1. [Options](#options)
    2. [Declaring "func"](#declaring-func)
    3. [The "russ" object](#the-russ-object)
  3. [Walkthrough examples](#walkthrough-examples)
    1. [Browsersync local static server](#browsersync-local-static-server)
    2. [A compilation task](#a-compilation-task)
    3. [A watcher](#a-watcher)
    4. [Concurrent development tasks](#concurrent-development-tasks)
4. [Under the hood](#under-the-hood)
5. [Contributing](#contributing)


## Why create russ?
To be honest, after trying different things, I just thought I'd have a go at creating my own CLI task runner.

There are various ways to run tasks. Using `npm run scripts` or a good self-documented `Makefile` can be a great solution but I personally still look for ways to handle running various node scripts in different ways with ease.

That's where `russ` has come from. It doesn't do anything overly special but provides a collections of features which personally appeal to me.

* A specific file for defining things like plugin options and source paths(`.russrc`)
* A specific folder for storing task files
* Pre and post hooks for tasks
* Use npm modules directly
* Ability to run tasks in sequence or concurrently
* Profiling
* Self documentation so that I don't have to crawl through task code to work out what's going on in certain tasks

## Setup
So. You've got this far and decided you want to try out `russ` :smile:

1. First, install `russ`;
```shell
$ npm install -g russ
```
2. Create an `.russrc` file in the root of your directory. The `.russrc` file is just a node module with a fancy name that exposes a `config` object. This object can be accessed by any of your tasks.
```shell
$ echo "module.exports = {};" > .russrc
```
3. Create an `russ.tasks` directory in the root of your directory. This directory will contain files defining tasks for `russ` to run. The best practice here is likely to be creating files for different concerns to adhere to a good separation of concerns. For example, if I have tasks for anything related to compiling style source, I'm likely to define these in `russ.tasks/styles.js`.

## Usage
Now we're all set up we can look at defining some tasks and config for `russ` to use.
### Basic CLI Usage
First of all though, we must explain how the CLI works.

If we simply run;
```shell
$ russ
```
`russ` will display any tasks that are available and their respective self-documented description.

To run a task, we pass the task name to `russ`. We can run more than one task at once and if we do, they will run concurrently. For example;
```shell
$ russ compile:scripts compile:styles
```
Lastly, we can pass an optional `env` option when we run `russ`. This can be used within tasks to trigger optional behaviour such as say minifying files.
```shell
$ russ compile:scripts --env prod
```

### Defining tasks
Use of `russ` is done so through defining tasks.

Each task is defined by an object. Each task file within `russ.tasks` should look to either export an `Object` or an `Array` of `Object`s.

Defining tasks __is__ simple but there are many options.

There are two types of task. There are tasks that define actual task behavior;
```javascript
module.exports = {
  name: 'task',
  doc : 'a short description of the task',
  pre : 'some:pre:task',
  post: 'some:post:task',
  deps: [
    'fs',
    'path'
  ],
  func: (fs, path, russ) => {
    russ.resolve();
  }
};
```
And there are tasks that actually just define that other tasks should run either in sequence or concurrently;
```javascript
module.exports = {
  name: 'compile',
  doc : 'compile all the things',
  concurrent: [
    'compile:stuff',
    'compile:other:stuff'
  ]
}
```
__NOTE::__ It's important to note that every task returns a `Promise` and resolving or rejecting within task logic is crucial when running more than one task at a time and when you wish for the profiler to work properly.

#### Options
* `name` `{String}` - task name and name by which task will be invoked
* `doc` `{String}` - brief description of task that is displayed when viewing available tasks
* `pre` `{String}` - the name of a task that should run before the defined task
* `post` `{String}` - the name of a task that should run after the defined task
* `deps` `{Array}` - an array of module names that are dependencies for our task
* `sequence` `{Array}` - an array of task names that will run in sequence
* `concurrent` `{Array}` - an array of task names that will run concurrently
* `func` `{Function}` - Logic for a task. The parameters are the defined dependencies followed by an `russ` Object.

#### Declaring `func`
One important part of declaring a task function is knowing the required anatomy of our tasks.
The arguments passed to our task are dependencies defined within `deps` followed by an Object that contains some important references. For example;
```javascript
deps: [
  'A',
  'B'
],
func: (a, b, russ) => {}
```
#### The `russ` object
When you define a function for your task, the last argument passed to that function will be an object we will call the `russ` object.

The `russ` object exposes the following things;
* config {Object} - the configuration defined within `.russrc`
* env {String} - the `russ` env defined when we invoke `russ` (`$ russ compile --env dist`)
* resolve {Function} - a function that tells `russ` that our task has finished successfully
* reject {Function} - a function that takes an error string as an argument and tells `russ` our task has failed
* log {Object} - an instance of the `russ` logger. `russ` uses `winston` and instead of requiring an extra logger you can make use of `info`, `log`, `warn`, `silly`, `error` and `success` logging by using `log`.
* run {Function} - a run function that takes another task name as an argument. This allows you to run tasks from within a task.

### Walkthrough examples
The documentation so far may make `russ` seem more complicated than it actually is. It may be easier to work through some common examples. For more examples see some of my own recipes [here](https://github.com/jh3y/russ-recipes).

#### BrowserSync local static server
For our first task we are going to create a local static server with reloading and CSS injection.

The dependencies for our task are going to be `browser-sync`, `vinyl-source-stream`, `vinyl-buffer` and `vinyl-file`.

First we install our dependencies;
```shell
$ npm install browser-sync vinyl-file vinyl-source-stream vinyl-buffer
```
Then we define our task structure in `russ.tasks/server.js`;
```javascript
module.exports = {
  name: 'server',
  doc: 'set up BrowserSync static server with liveReload and CSS injection',
  deps: [
    'browser-sync',
    'vinyl-source-stream',
    'vinyl-buffer',
    'vinyl-file'
  ],
  func: (browserSync, vss, vb, vf, russ) => {
    const server = browserSync.create();
    server.init({
      name: 'russServer',
      server: 'public/',
      port  : 2222
    });
    server.watch('public/**/*.*', (evt, file) => {
      if (evt === 'change' && file.indexOf('.css') === -1)
        server.reload();
      if (evt === 'change' && file.indexOf('.css') !== -1)
        vf.readSync(file)
          .pipe(vss(file))
          .pipe(vb())
          .pipe(server.stream());
    });
  }
};
```
Preferably, we don't want to leave plugin options and source paths inside our task logic so we move those into `.russrc` and update our task logic
```javascript
func: (browserSync, vss, vb, vf, russ) => {
  const server = browserSync.create();
  server.init(russ.config.pluginOpts.browsersync);
  server.watch(russ.config.paths.sources.overwatch, (evt, file) => {
    if (evt === 'change' && file.indexOf('.css') === -1)
      server.reload();
    if (evt === 'change' && file.indexOf('.css') !== -1)
      vf.readSync(file)
        .pipe(vss(file))
        .pipe(vb())
        .pipe(server.stream());
  });
}
```
To run our task;
```shell
$ russ server
```
To improve this further we may wish to add a `pre` hook that compiles our sources. This could be a concurrent task that ensures there are files to serve for BrowserSync.

#### A compilation task
For a compilation task we will look at compiling some markup files.
```javascript
{
  name: 'compile:markup',
  doc : 'compile markup',
  deps: [
    'fs',
    'glob',
    'pug',
    'path',
    'mkdirp'
  ],
  func: (fs, glob, pug, path, mkdirp, russ) => {
    const outputDir = russ.config.paths.destinations.markup;
    mkdirp.sync(outputDir);
    glob(russ.config.paths.sources.docs, (err, files) => {
      for (const file of files) {
        try {
          const data = russ.config.pluginOpts.pug.data,
            markup = pug.compileFile(`${process.cwd()}/${file}`)(data),
            name = path.basename(file, '.pug'),
            loc = `${outputDir}${name}.html`;
          fs.writeFileSync(loc, markup);
          russ.log.info(`${loc} created!`);
        } catch (err) {
          russ.reject(err);
        }
      }
      russ.resolve();
    });
  }
}
```

#### A watcher
A common task will be watching some source and running some task when a file is edited. In this example, we are watching for changed in our scripts and running a `compile:scripts` task when things change. We use `gaze` to do our watching.
```javascript
{
  name: 'watch:scripts',
  doc: 'watch for script source changes then run and compile',
  deps: [
    'gaze'
  ],
  func: function(gaze, russ) {
    gaze(russ.config.paths.sources.scripts, (err, watcher) => {
      watcher.on('changed', (filepath) => {
        russ.log.info(`${filepath} changed!`);
        russ.run('compile:scripts');
      });
    });
  }
}
```

#### Concurrent development tasks
How about some tasks that define common things that we may want to do with our source. For example, we could have a `development` task that sets up a global watcher and our server task from above.
```javascript
module.exports = [
  {
    name: 'compile',
    doc : 'compiles sources',
    concurrent: [
      'compile:styles',
      'compile:scripts',
      'compile:markup'
    ]
  },
  {
    name: 'watch',
    doc: 'watch files and do things',
    concurrent: [
      'watch:scripts',
      'watch:styles',
      'watch:markup'
    ]
  },
  {
    name: 'develop',
    doc: 'lets develop',
    concurrent: [
      'watch',
      'server'
    ]
  }
];
```
## Under the hood
`russ` is developed using `babel`. It relies heavily on `Promise`s for profiling and other behavioural features.

## Contributing
I'm very open to issue and pull request submissions for anywhere you feel `russ` could be improved or made more intuitive and user friendly :smile:

===

Any problems or questions, feel free to post an issue/PR or tweet me, [@_jh3y](https://twitter.com/@_jh3y)!

_made with :heart: by [jh3y](twitter.com/_jh3y) 2016_
