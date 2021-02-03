# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.0.6](https://github.com/zemirco/json2csv/compare/v5.0.5...v5.0.6) (2021-02-03)


### Bug Fixes

* Escape quotes excel ([#512](https://github.com/zemirco/json2csv/issues/512)) ([ab3bf8a](https://github.com/zemirco/json2csv/commit/ab3bf8ad3ce64cff7d6149e1b70f92b71bebf6c7))

### [5.0.5](https://github.com/zemirco/json2csv/compare/v5.0.4...v5.0.5) (2020-11-16)


### Bug Fixes

* don't mutate original object in unset ([#499](https://github.com/zemirco/json2csv/issues/499)) ([6e4ea5e](https://github.com/zemirco/json2csv/commit/6e4ea5ebdc263006ca6ff45879fbb7e0bd65bef2))

### [5.0.4](https://github.com/zemirco/json2csv/compare/v5.0.3...v5.0.4) (2020-11-10)


### Bug Fixes

* Fix issue with unwind and empty arrays creating an extra column ([#496](https://github.com/zemirco/json2csv/issues/496)) ([0b331fc](https://github.com/zemirco/json2csv/commit/0b331fc3ad345f8062abe60f64cb3b43dad30fb0))

### [5.0.3](https://github.com/zemirco/json2csv/compare/v5.0.2...v5.0.3) (2020-09-24)


### Bug Fixes

* audit dependencies fix ([d6d0fc7](https://github.com/zemirco/json2csv/commit/d6d0fc78128e01e021414aaf52a65cbcd09a1225))
* update commander dep ([322e568](https://github.com/zemirco/json2csv/commit/322e568793ec4a64f43ec2ac82c9886177bcc4ed))

### [5.0.2](https://github.com/zemirco/json2csv/compare/v5.0.1...v5.0.2) (2020-09-24)


### Bug Fixes

* **cli:** fix relative paths issue in CLI when not streaming ([#488](https://github.com/zemirco/json2csv/issues/488)) ([06079e8](https://github.com/zemirco/json2csv/commit/06079e840128030eacfecde66da11295eb162234))

### [5.0.1](https://github.com/zemirco/json2csv/compare/v5.0.0...v5.0.1) (2020-04-28)


### Bug Fixes

* wrong call to processValue ([#454](https://github.com/zemirco/json2csv/issues/454)) ([66abd45](https://github.com/zemirco/json2csv/commit/66abd45))

## [5.0.0](https://github.com/zemirco/json2csv/compare/v4.5.2...v5.0.0) (2020-03-15)


### ⚠ BREAKING CHANGES

* Node 8 and 9 no longer supported, use Node 10 or greater. It might still work, but it has reached End-Of-Life.
* module no longer takes `unwind`, `unwindBlank`, `flatten` or the `flattenSeparator` options, instead see the new `transforms` option. CLI options are unchanged from the callers side, but use the built in transforms under the hood.

* Add support for transforms

* Add documentation about transforms
* remove extra commonjs build, use starting point in package.json `main` field.
* Renamed `doubleQuote` to `escapedQuote`
* remove `stringify` option
* `--fields-config` option has been removed, use the new `--config` option for all configuration, not just fields.
* Drop node 6 and 7, and add node 11 and 12

### Bug Fixes

* Always error asynchronously from parseAsync method ([#412](https://github.com/zemirco/json2csv/issues/412)) ([16cc044](https://github.com/zemirco/json2csv/commit/16cc044))
* audit deps ([15992cf](https://github.com/zemirco/json2csv/commit/15992cf))
* drop Node 8 and 9 ([7295465](https://github.com/zemirco/json2csv/commit/7295465))
* Make some CLI options mandatory ([#433](https://github.com/zemirco/json2csv/issues/433)) ([bd51527](https://github.com/zemirco/json2csv/commit/bd51527))
* Remove CommonJS build ([#422](https://github.com/zemirco/json2csv/issues/422)) ([5ce0089](https://github.com/zemirco/json2csv/commit/5ce0089))
* Remove stringify option ([#419](https://github.com/zemirco/json2csv/issues/419)) ([39f303d](https://github.com/zemirco/json2csv/commit/39f303d))
* Rename doubleQuote to escapedQuote ([#418](https://github.com/zemirco/json2csv/issues/418)) ([f99408c](https://github.com/zemirco/json2csv/commit/f99408c))
* update CI node versions ([#413](https://github.com/zemirco/json2csv/issues/413)) ([6fd6c09](https://github.com/zemirco/json2csv/commit/6fd6c09))
* update commander cli dep ([74aa40a](https://github.com/zemirco/json2csv/commit/74aa40a))
* update commander dep ([272675b](https://github.com/zemirco/json2csv/commit/272675b))
* **deps:** audit dependencies ([bf9877a](https://github.com/zemirco/json2csv/commit/bf9877a))
* **deps:** update commander ([3f099f2](https://github.com/zemirco/json2csv/commit/3f099f2))
* **security:** fix audit vulnerabilities ([b57715b](https://github.com/zemirco/json2csv/commit/b57715b))


### Features

* Add support for flattening arrays and change transforms arguments to an object. ([#432](https://github.com/zemirco/json2csv/issues/432)) ([916e448](https://github.com/zemirco/json2csv/commit/916e448))
* Add support for transforms ([#431](https://github.com/zemirco/json2csv/issues/431)) ([f1d04d0](https://github.com/zemirco/json2csv/commit/f1d04d0))
* Improve async promise to optionally not return ([#421](https://github.com/zemirco/json2csv/issues/421)) ([3e296f6](https://github.com/zemirco/json2csv/commit/3e296f6))
* Improves the unwind transform so it unwinds all unwindable fields if … ([#434](https://github.com/zemirco/json2csv/issues/434)) ([ec1f301](https://github.com/zemirco/json2csv/commit/ec1f301))
* replace fields config by a global config ([#338](https://github.com/zemirco/json2csv/issues/338)) ([d6c1c5f](https://github.com/zemirco/json2csv/commit/d6c1c5f))

## [4.5.2](https://github.com/zemirco/json2csv/compare/v4.5.1...v4.5.2) (2019-07-05)


### Bug Fixes

* Improve the inference of the header name when using function as value ([#395](https://github.com/zemirco/json2csv/issues/395)) ([590d19a](https://github.com/zemirco/json2csv/commit/590d19a))



<a name="4.4.0"></a>
## [4.4.0](https://github.com/zemirco/json2csv/compare/v4.3.5...v4.4.0) (2019-03-25)


### Features

* Performance improvements and new async api ([#360](https://github.com/zemirco/json2csv/issues/360)) ([d59dea1](https://github.com/zemirco/json2csv/commit/d59dea1))


<a name="4.3.5"></a>
## [4.3.5](https://github.com/zemirco/json2csv/compare/v4.3.4...v4.3.5) (2019-02-22)


### Bug Fixes

* audit deps ([3182707](https://github.com/zemirco/json2csv/commit/3182707))
* unwind of nested fields ([#357](https://github.com/zemirco/json2csv/issues/357)) ([2d69281](https://github.com/zemirco/json2csv/commit/2d69281))



<a name="4.3.4"></a>
## [4.3.4](https://github.com/zemirco/json2csv/compare/v4.3.3...v4.3.4) (2019-02-11)


### Bug Fixes

* issue with fields.value function not receiving correct fields ([#353](https://github.com/zemirco/json2csv/issues/353)) ([851c02f](https://github.com/zemirco/json2csv/commit/851c02f))



<a name="4.3.3"></a>
## [4.3.3](https://github.com/zemirco/json2csv/compare/v4.3.2...v4.3.3) (2019-01-11)


### Bug Fixes

* audit dep fix ([1ef4bcd](https://github.com/zemirco/json2csv/commit/1ef4bcd))
* Remove invalid reference to flat ([#347](https://github.com/zemirco/json2csv/issues/347)) ([130ef7d](https://github.com/zemirco/json2csv/commit/130ef7d))
* Remove preferGlobal from package.json ([#346](https://github.com/zemirco/json2csv/issues/346)) ([2b6ad3a](https://github.com/zemirco/json2csv/commit/2b6ad3a))



<a name="4.3.2"></a>
## [4.3.2](https://github.com/zemirco/json2csv/compare/v4.3.1...v4.3.2) (2018-12-08)


### Bug Fixes

* Remove lodash.clonedeep dependency ([#339](https://github.com/zemirco/json2csv/issues/339)) ([d28955a](https://github.com/zemirco/json2csv/commit/d28955a)), closes [#333](https://github.com/zemirco/json2csv/issues/333)



<a name="4.3.1"></a>
## [4.3.1](https://github.com/zemirco/json2csv/compare/v4.3.0...v4.3.1) (2018-11-17)


### Bug Fixes

* Return correct exit code on error ([#337](https://github.com/zemirco/json2csv/issues/337)) ([a793de5](https://github.com/zemirco/json2csv/commit/a793de5))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/zemirco/json2csv/compare/v4.2.1...v4.3.0) (2018-11-05)


### Bug Fixes

* Optimize performance around the usage of fields ([#328](https://github.com/zemirco/json2csv/issues/328)) ([d9e4463](https://github.com/zemirco/json2csv/commit/d9e4463))
* Remove wrong submodule ([#326](https://github.com/zemirco/json2csv/issues/326)) ([6486bb0](https://github.com/zemirco/json2csv/commit/6486bb0))


### Features

* Add support for objectMode in the stream API ([#325](https://github.com/zemirco/json2csv/issues/325)) ([8f0ae55](https://github.com/zemirco/json2csv/commit/8f0ae55))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/zemirco/json2csv/compare/v4.2.0...v4.2.1) (2018-08-06)


### Bug Fixes

* bug that modifies opts after parsing an object/stream ([#318](https://github.com/zemirco/json2csv/issues/318)) ([f0a4830](https://github.com/zemirco/json2csv/commit/f0a4830))
* Clean up the flattening separator feature ([#315](https://github.com/zemirco/json2csv/issues/315)) ([ee3d181](https://github.com/zemirco/json2csv/commit/ee3d181))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/zemirco/json2csv/compare/v4.1.6...v4.2.0) (2018-07-31)


### Features

* Added flattenSeparator option ([#314](https://github.com/zemirco/json2csv/issues/314)) ([5c5de9f](https://github.com/zemirco/json2csv/commit/5c5de9f))



<a name="4.1.6"></a>
## [4.1.6](https://github.com/zemirco/json2csv/compare/v4.1.5...v4.1.6) (2018-07-12)


### Bug Fixes

* Update dependencies and remove cli-table2 dependency ([#312](https://github.com/zemirco/json2csv/issues/312)) ([5981ba3](https://github.com/zemirco/json2csv/commit/5981ba3))



<a name="4.1.5"></a>
## [4.1.5](https://github.com/zemirco/json2csv/compare/v4.1.4...v4.1.5) (2018-06-26)


### Bug Fixes

* Process stdin as a stream ([#308](https://github.com/zemirco/json2csv/issues/308)) ([2b186b6](https://github.com/zemirco/json2csv/commit/2b186b6))



<a name="4.1.4"></a>
## [4.1.4](https://github.com/zemirco/json2csv/compare/v4.1.3...v4.1.4) (2018-06-23)


### Bug Fixes

* don't escape tabs ([#305](https://github.com/zemirco/json2csv/issues/305)) ([a36c8e3](https://github.com/zemirco/json2csv/commit/a36c8e3))



<a name="4.1.3"></a>
## [4.1.3](https://github.com/zemirco/json2csv/compare/v4.1.2...v4.1.3) (2018-05-23)


### Bug Fixes

* Escape custom quotes correctly ([#301](https://github.com/zemirco/json2csv/issues/301)) ([7d57208](https://github.com/zemirco/json2csv/commit/7d57208))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/zemirco/json2csv/compare/v4.1.1...v4.1.2) (2018-04-16)


### Bug Fixes

* **tests:** Skip bogus pretty print tests only in old node versions ([#290](https://github.com/zemirco/json2csv/issues/290)) ([0f3b885](https://github.com/zemirco/json2csv/commit/0f3b885))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/zemirco/json2csv/compare/v4.1.0...v4.1.1) (2018-04-16)


### Bug Fixes

*  readme CLI's info ([#289](https://github.com/zemirco/json2csv/issues/289)) ([9fe65b3](https://github.com/zemirco/json2csv/commit/9fe65b3))
* Add tests and docs to unwind-blank feature ([#287](https://github.com/zemirco/json2csv/issues/287)) ([e3d4a05](https://github.com/zemirco/json2csv/commit/e3d4a05))
* **perf:** Improve unwind performance and maintainability ([#288](https://github.com/zemirco/json2csv/issues/288)) ([80e496d](https://github.com/zemirco/json2csv/commit/80e496d))



<a name="4.1.0"></a>
## [4.1.0](https://github.com/zemirco/json2csv/compare/v4.0.4...v4.1.0) (2018-04-16)


### Bug Fixes

* Avoid redundant deep cloning when unwinding. ([#286](https://github.com/zemirco/json2csv/issues/286)) ([95a6ca9](https://github.com/zemirco/json2csv/commit/95a6ca9))


### Features

* Add ability to unwind by blanking out instead of repeating data ([#285](https://github.com/zemirco/json2csv/issues/285)) ([61d9808](https://github.com/zemirco/json2csv/commit/61d9808))



<a name="4.0.4"></a>
## [4.0.4](https://github.com/zemirco/json2csv/compare/v4.0.3...v4.0.4) (2018-04-10)


### Bug Fixes

* comment out failing tests ([#283](https://github.com/zemirco/json2csv/issues/283)) ([5b25eaa](https://github.com/zemirco/json2csv/commit/5b25eaa))
* Support empty array with opts.fields ([#281](https://github.com/zemirco/json2csv/issues/281)) ([eccca89](https://github.com/zemirco/json2csv/commit/eccca89))
* **tests:** emit correct lines from transform ([#282](https://github.com/zemirco/json2csv/issues/282)) ([2322ddf](https://github.com/zemirco/json2csv/commit/2322ddf))



<a name="4.0.3"></a>
## [4.0.3](https://github.com/zemirco/json2csv/compare/v4.0.2...v4.0.3) (2018-04-09)


### Bug Fixes

* error when a field is null and flatten is used ([#274](https://github.com/zemirco/json2csv/issues/274)) ([1349a94](https://github.com/zemirco/json2csv/commit/1349a94))
* throw error for empty dataset only if fields not specified ([0d8534e](https://github.com/zemirco/json2csv/commit/0d8534e))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/zemirco/json2csv/compare/v4.0.1...v4.0.2) (2018-03-09)


### Bug Fixes

* **parser:** RangeError ([#271](https://github.com/zemirco/json2csv/issues/271)) ([c8d5a87](https://github.com/zemirco/json2csv/commit/c8d5a87))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/zemirco/json2csv/compare/v4.0.0...v4.0.1) (2018-03-05)


### Bug Fixes

* double quote escaping before new line ([#268](https://github.com/zemirco/json2csv/issues/268)) ([fa991cf](https://github.com/zemirco/json2csv/commit/fa991cf))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/zemirco/json2csv/compare/v4.0.0-alpha.2...v4.0.0) (2018-02-27)


### Bug Fixes

* Replace webpack with rollup packaging ([#266](https://github.com/zemirco/json2csv/issues/266)) ([a9f8020](https://github.com/zemirco/json2csv/commit/a9f8020))


### Features

* Pass transform options through ([#262](https://github.com/zemirco/json2csv/issues/262)) ([650913f](https://github.com/zemirco/json2csv/commit/650913f))



<a name="4.0.0-alpha.2"></a>
# [4.0.0-alpha.2](https://github.com/zemirco/json2csv/compare/v4.0.0-alpha.1...v4.0.0-alpha.2) (2018-02-25)


### Bug Fixes

* flatten issue with toJSON ([#259](https://github.com/zemirco/json2csv/issues/259)) ([7006d2b](https://github.com/zemirco/json2csv/commit/7006d2b))



<a name="4.0.0-alpha.1"></a>
# [4.0.0-alpha.1](https://github.com/zemirco/json2csv/compare/v4.0.0-alpha.0...v4.0.0-alpha.1) (2018-02-21)


### Bug Fixes

* Remove TypeScript definition ([#256](https://github.com/zemirco/json2csv/issues/256)) ([4f09694](https://github.com/zemirco/json2csv/commit/4f09694))



<a name="4.0.0-alpha.0"></a>
# [4.0.0-alpha.0](https://github.com/zemirco/json2csv/compare/v3.11.5...v4.0.0-alpha.0) (2018-02-21)


### Bug Fixes

* Add CLI tests ([#247](https://github.com/zemirco/json2csv/issues/247)) ([bb8126f](https://github.com/zemirco/json2csv/commit/bb8126f))
* Add excel string to cli and standardize ([#231](https://github.com/zemirco/json2csv/issues/231)) ([421baad](https://github.com/zemirco/json2csv/commit/421baad))
* Allow passing ldjson input files ([#220](https://github.com/zemirco/json2csv/issues/220)) ([9c861ed](https://github.com/zemirco/json2csv/commit/9c861ed))
* Avoid throwing an error on elements that can't be stringified (like functions) ([#223](https://github.com/zemirco/json2csv/issues/223)) ([679c687](https://github.com/zemirco/json2csv/commit/679c687))
* backslash logic ([#222](https://github.com/zemirco/json2csv/issues/222)) ([29e9445](https://github.com/zemirco/json2csv/commit/29e9445))
* broken stdin input ([#241](https://github.com/zemirco/json2csv/issues/241)) ([6cb407c](https://github.com/zemirco/json2csv/commit/6cb407c))
* Combine EOL and newLine parameters ([#219](https://github.com/zemirco/json2csv/issues/219)) ([4668a8b](https://github.com/zemirco/json2csv/commit/4668a8b))
* header flag ([#221](https://github.com/zemirco/json2csv/issues/221)) ([7f7338f](https://github.com/zemirco/json2csv/commit/7f7338f))
* outdated jsdoc ([#243](https://github.com/zemirco/json2csv/issues/243)) ([efe9888](https://github.com/zemirco/json2csv/commit/efe9888))
* pretty print issues ([#242](https://github.com/zemirco/json2csv/issues/242)) ([3bd9655](https://github.com/zemirco/json2csv/commit/3bd9655))
* Process header cells as any other cell ([#244](https://github.com/zemirco/json2csv/issues/244)) ([1fcde13](https://github.com/zemirco/json2csv/commit/1fcde13))
* Remove callback support ([2096ade](https://github.com/zemirco/json2csv/commit/2096ade))
* Remove fieldNames ([#232](https://github.com/zemirco/json2csv/issues/232)) ([6cc74b2](https://github.com/zemirco/json2csv/commit/6cc74b2))
* Remove path-is-absolute dependency ([#225](https://github.com/zemirco/json2csv/issues/225)) ([f71a3df](https://github.com/zemirco/json2csv/commit/f71a3df))
* Rename hasCSVColumnTitle to noHeader ([#216](https://github.com/zemirco/json2csv/issues/216)) ([f053c8b](https://github.com/zemirco/json2csv/commit/f053c8b))
* Rename ld-json to ndjson ([#240](https://github.com/zemirco/json2csv/issues/240)) ([24a7893](https://github.com/zemirco/json2csv/commit/24a7893))
* Rename unwindPath to unwind ([#230](https://github.com/zemirco/json2csv/issues/230)) ([7143bc7](https://github.com/zemirco/json2csv/commit/7143bc7))
* Streamify pretty print ([#248](https://github.com/zemirco/json2csv/issues/248)) ([fb7ad53](https://github.com/zemirco/json2csv/commit/fb7ad53))


### Chores

* Refactor the entire library to ES6 ([#233](https://github.com/zemirco/json2csv/issues/233)) ([dce4d33](https://github.com/zemirco/json2csv/commit/dce4d33))


### Features

* add doubleQuote to cli, rename other options to line up with the cli ([5e402dc](https://github.com/zemirco/json2csv/commit/5e402dc))
* Add fields config option to CLI ([#245](https://github.com/zemirco/json2csv/issues/245)) ([74ef666](https://github.com/zemirco/json2csv/commit/74ef666))
* Add streaming API ([#235](https://github.com/zemirco/json2csv/issues/235)) ([01ca93e](https://github.com/zemirco/json2csv/commit/01ca93e))
* Split tests in multiple files ([#246](https://github.com/zemirco/json2csv/issues/246)) ([839de77](https://github.com/zemirco/json2csv/commit/839de77))


### BREAKING CHANGES

* Replaces field-list with field-config
* Remove `preserveNewLinesInValues` option, preserve by default

* Refactor the entire library to ES6

* Fix PR issues

* Add strict mode for node 4.X
* Remove fieldNames

* Increase coverage back to 100%
* callback is no longer available, just return the csv from the json2csv.

- updated tests
- updated readme
* * Rename unwindPath to unwind

* Fix field-list in CLI
* newLine removed, eol kept.
* Rename del to delimiter to match the cli flag
* Rename quotes to quote to match the cli flag

* Remove unused double quotes comment

* Fix noHeader in CLI

* Revert "Remove unused double quotes comment"

This reverts commit 250d3e6ddf3062cbdc1e0174493a37fa21197d8e.

* Add doubleQuote to CLI
* Rename hasCSVColumnTitle to noHeader to keep in line with the CLI



<a name="3.11.5"></a>
## [3.11.5](https://github.com/zemirco/json2csv/compare/v3.11.4...v3.11.5) (2017-10-23)


### Bug Fixes

* backslash value not escaped properly ([#202](https://github.com/zemirco/json2csv/issues/202)) ([#204](https://github.com/zemirco/json2csv/issues/204)) ([2cf50f1](https://github.com/zemirco/json2csv/commit/2cf50f1))



<a name="3.11.4"></a>
## [3.11.4](https://github.com/zemirco/json2csv/compare/v3.11.3...v3.11.4) (2017-10-09)


### Bug Fixes

* **security:** Update debug to 3.1.0 for security reasons ([9c7cfaa](https://github.com/zemirco/json2csv/commit/9c7cfaa))



<a name="3.11.3"></a>
## [3.11.3](https://github.com/zemirco/json2csv/compare/v3.11.2...v3.11.3) (2017-10-09)



<a name="3.11.2"></a>
## [3.11.2](https://github.com/zemirco/json2csv/compare/v3.11.1...v3.11.2) (2017-09-13)


### Bug Fixes

* Remove extra space character in mode withBOM: true [#190](https://github.com/zemirco/json2csv/issues/190) ([#194](https://github.com/zemirco/json2csv/issues/194)) ([e8b6f6b](https://github.com/zemirco/json2csv/commit/e8b6f6b))



<a name="3.11.1"></a>
## [3.11.1](https://github.com/zemirco/json2csv/compare/v3.11.0...v3.11.1) (2017-08-11)


### Bug Fixes

* **cli:** pass BOM cli option to function ([#193](https://github.com/zemirco/json2csv/issues/193)) ([70cfdfe](https://github.com/zemirco/json2csv/commit/70cfdfe))



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

* Preserve new lines in cells with option `preserveNewLinesInValues` ([#91](https://github.com/zemirco/json2csv/issues/91)) ([#171](https://github.com/zemirco/json2csv/issues/171)) ([187b701](https://github.com/zemirco/json2csv/commit/187b701))



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
