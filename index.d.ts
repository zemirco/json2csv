declare namespace json2csv {
  interface FieldValueCallback<T> {
    (row: T, field: string, data: string): string;
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

  interface Callback {
    (error: Error, csv: string): void;
  }
}

declare function json2csv<T>(data: Any, options: json2csv.Options<T>, callback: json2csv.Callback): void;
declare function json2csv<T>(data: Any, options: json2csv.Options<T>): string;
declare function json2csv(data: Any, options: json2csv.Options<{ [key: string]: string; }>, callback: json2csv.Callback): void;
declare function json2csv(data: Any, options: json2csv.Options<{ [key: string]: string; }>): string;

export = json2csv;
