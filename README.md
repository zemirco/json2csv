# :warning: WARNING: THIS PACKAGE IS ABANDONED

The code has moved to a [new home](https://github.com/juanjoDiaz/json2csv).

This repository stays as a the historic home of `json2csv` up until v5.
From v6, the library has been broken into smaller libraries that are now published to NPM independently:

* **[Plainjs](https://www.npmjs.com/package/@json2csv/plainjs):** Includes the `Parser` API and a new `StreamParser` API which doesn't the conversion in a streaming fashion in pure js.
* **[Node](https://www.npmjs.com/package/@json2csv/node):** Includes the `Node Transform` and `Node Async Parser` APIs for Node users.
* **[WHATWG](https://www.npmjs.com/package/@json2csv/whatwg):** Includes the `WHATWG Transform Stream` and `WHATWG Async Parser` APIs for users of WHATWG streams (browser, Node or Deno).
* **[CLI](https://www.npmjs.com/package/@json2csv/cli):** Includes the `CLI` interface.
* **[Transforms](https://www.npmjs.com/package/@json2csv/transforms):** Includes the built-in `transforms` for json2csv.
* **[Formatters](https://www.npmjs.com/package/@json2csv/formatters):** Includes the built-in `formatters` for json2csv. Formatters are the new way to format data before adding it to the resulting CSV.

Up-to-date documentation of the library can be found at https://juanjodiaz.github.io/json2csv