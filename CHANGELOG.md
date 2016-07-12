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
