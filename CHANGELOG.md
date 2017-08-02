# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.11.0"></a>
# [3.11.0](https://github.com/zemirco/json2csv/compare/v3.10.0...v3.11.0) (2017-08-02)


### Bug Fixes

* Handle dates without double-escaping ([#189](https://github.com/zemirco/json2csv/issues/189)) ([ff514ba](https://github.com/zemirco/json2csv/commit/ff514ba))
* unwind parameter in command line mode ([#191](https://github.com/zemirco/json2csv/issues/191)) ([e706c25](https://github.com/zemirco/json2csv/commit/e706c25))


### Features

* Added flag to signal if resulting function value should be stringified or not ([#192](https://github.com/zemirco/json2csv/issues/192)) ([aaa6b05](https://github.com/zemirco/json2csv/commit/aaa6b05))



<a name="3.10.0"></a>
# [3.10.0](https://github.com/zemirco/json2csv/compare/v3.9.1...v3.10.0) (2017-07-24)


### Features

* Add BOM character option ([#187](https://github.com/zemirco/json2csv/issues/187)) ([0c799ca](https://github.com/zemirco/json2csv/commit/0c799ca))



<a name="3.9.1"></a>
## [3.9.1](https://github.com/zemirco/json2csv/compare/v3.9.0...v3.9.1) (2017-07-14)



<a name="3.9.0"></a>
# [3.9.0](https://github.com/zemirco/json2csv/compare/v3.8.0...v3.9.0) (2017-07-11)


### Features

* Parameter unwindPath for multiple fields ([#174](https://github.com/zemirco/json2csv/issues/174)) ([#183](https://github.com/zemirco/json2csv/issues/183)) ([fbcaa10](https://github.com/zemirco/json2csv/commit/fbcaa10))



<a name="3.8.0"></a>
# [3.8.0](https://github.com/zemirco/json2csv/compare/v3.7.3...v3.8.0) (2017-07-03)


### Bug Fixes

* **docs:** Add a coma in the ReadMe example ([#181](https://github.com/zemirco/json2csv/issues/181)) ([abeb820](https://github.com/zemirco/json2csv/commit/abeb820))


### Features

* Preserve new lines in cells with option preserveNewLinesInCells ([#91](https://github.com/zemirco/json2csv/issues/91)) ([#171](https://github.com/zemirco/json2csv/issues/171)) ([187b701](https://github.com/zemirco/json2csv/commit/187b701))



<a name="3.7.3"></a>
## [3.7.3](https://github.com/zemirco/json2csv/compare/v3.7.1...v3.7.3) (2016-12-08)


### Bug Fixes

* **jsdoc:** JSDoc Editting ([#155](https://github.com/zemirco/json2csv/issues/155)) ([76075d6](https://github.com/zemirco/json2csv/commit/76075d6))
* **ts:** Fix type definition ([#154](https://github.com/zemirco/json2csv/issues/154)) ([fae53a1](https://github.com/zemirco/json2csv/commit/fae53a1))



## 3.6.3 / 2016-08-17

  * Fix crashing on EPIPE error [#134](https://github.com/zemirco/json2csv/pull/134)
  * Add UMD build for browser usage [#136](https://github.com/zemirco/json2csv/pull/136)
  * Add docs during prepublish

## 3.6.2 / 2016-07-22

  * Remove debugger, see [#132](https://github.com/zemirco/json2csv/pull/132)
  * Fix changelog typo

## 3.6.1 / 2016-07-12

  * Fix auto-fields returning all available fields, even if not available on the first object, see #104

## 3.6.0 / 2016-07-07

  * Make callback optional
  * Make callback use `process.nextTick`, so it's not sync

  Thanks @STRML!

## 3.5.1 / 2016-06-29

  * Revert [#114](https://github.com/zemirco/json2csv/pull/114), due to more issues
  * Update npmignore
  * Add a changelog
  * Updatee readme

## 3.5.0 / 2016-06-21

  * `includeEmptyRows` options added, see [#122](https://github.com/zemirco/json2csv/pull/122) (Thanks @glutentag)
  * `-a` or `--include-empty-rows` added for the CLI.

## 2.2.1 / 2013-11-10

  * mainly for development e.g. adding code format, update readme..

## 2.2.0 / 2013-11-08

  * not create CSV column title by passing hasCSVColumnTitle: false, into params.
  * if field is not exist in object then the field value in CSV will be empty.
  * fix data in object format - {...}

## 2.1.0 / 2013-06-11

  * quote titles in the first row

## 2.0.0 / 2013-03-04

  * err in callback function

## 1.3.1 / 2013-02-20

  * fix stdin encoding

## 1.3.0 / 2013-02-20

  * support reading from stdin [#9](https://github.com/zeMirco/json2csv/pull/9)

## 1.2.0 / 2013-02-20

  * support custom field names [#8](https://github.com/zeMirco/json2csv/pull/8)

## 1.1.0 / 2013-01-19

  * add optional custom delimiter
