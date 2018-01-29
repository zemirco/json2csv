declare namespace json2csv {
  interface FieldValueCallback<T> {
    (row: T, field: string): string;
  }

  interface FieldBase {
    label?: string;
    default?: string;
  }

  interface Field extends FieldBase {
    value: string;
  }

  interface CallbackField<T> extends FieldBase {
    value: FieldValueCallback<T>;
  }

  interface Options<T> {
    ndjson?: boolean;
    fields?: (string | Field | CallbackField<T>)[];
    unwind?: string | string[];
    flatten?: boolean;
    defaultValue?: string;
    quote?: string;
    doubleQuote?: string;
    delimiter?: string;
    eol?: string;
    excelStrings?: boolean;
    header?: boolean;
    includeEmptyRows?: boolean;
    withBOM?: boolean;
  }
}

declare function parse<T>(data: Any, options: json2csv.Options<T>): string;
declare function parse(data: Any, options: json2csv.Options<{ [key: string]: string; }>): string;

export = parse;
