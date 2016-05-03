![alt tag](https://raw.github.com/jh3y/pics/master/aby/aby-sm.png)
AbY - _a node script runner_
===
```shell
$ aby compile
[aby] Running compile
[aby] Finished compile in 1.27s
```
```javascript
module.exports = {
  name: 'compile',
  doc : 'Compile sources',
  deps: [
    'some-module'
  ],
  func: (someModule, aby) => {
    someModule.compile(aby.config.sources.scripts);
    setTimeout(aby.resolve);
  }
}
```
`AbY` is a result of my personal exploration of different methods for task running

* No specific ecosystem so no outdated dependencies
* Self documented tasks for newcomers simply by running `aby`
* Run tasks in sequence or concurrently
* Pre and post hooks for tasks
* Just uses node
* Profiles running time of tasks
* Just does what you tell it

## Why create AbY?
To be honest, after trying different things, I just thought I'd have a go at creating my own CLI task runner.

There are various ways to run tasks. Using `npm run scripts` or a good self-documented `Makefile` can be a great solution but I personally still look for ways to handle running various node scripts in different ways with ease.

That's where `AbY` has come from. It doesn't do anything overly special but provides a collections of features which personally appeal to me.

* A specific file for defining things like plugin options and source paths(`.abyrc`)
* A specific folder for storing task files
* Pre and post hooks for tasks
* Use npm modules directly
* Ability to run tasks in sequence or concurrently
* Profiling
* Self documentation so that I don't have to crawl through task code to work out what's going on in certain tasks

## Setup
So. You've got this far and decided you want to try out `AbY` :smile:
1. First, install `AbY`;
```shell
$ npm install -g aby
```
2. Create an `.abyrc` file in the root of your directory. The `.abyrc` file is just a node module with a fancy name that exposes a `config` object. This object can be accessed by any of your tasks.
```shell
$ echo "module.exports = {};" > .abyrc
```
3. Create an `aby.tasks` directory in the root of your directory. This directory will contain files defining tasks for `AbY` to run. The best practice here is likely to be creating files for different concerns to adhere to a good separation of concerns. For example, if I have tasks for anything related to compiling style source, I'm likely to define these in `aby.tasks/styles.js`.

## Usage
Now we're all set up we can look at defining some tasks and config for `AbY` to use.
### Defining tasks
Each task is defined by an object. Each task file within `aby.tasks` should look to either export an `Object` or an `Array` of `Object`s.

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
  func: (fs, path, aby) => {
    aby.resolve();
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
#### Options
* `name` `{String}` - task name and name by which task will be invoked
* `doc` `{String}` - brief description of task that is displayed when viewing available tasks
* `pre` `{String}` - the name of a task that should run before the defined task
* `post` `{String}` - the name of a task that should run after the defined task
* `deps` `{Array}` - an array of module names that are dependencies for our task
* `sequence` `{Array}` - an array of task names that will run in sequence
* `concurrent` `{Array}` - an array of task names that will run concurrently
* `func` `{Function}` - Logic for a task. The parameters are the defined dependencies followed by an `aby` Object.

#### Declaring `func`



@[jh3y](twitter.com/_jh3y) 2016
