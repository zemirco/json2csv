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
    data: T[];
    fields?: (string | Field | CallbackField<T>)[];
    fieldNames?: string[];
    delimiter?: string;
    defaultValue?: string;
    quote?: string;
    doubleQuote?: string;
    noHeader?: boolean;
    eol?: string;
    flatten?: boolean;
    unwindPath?: string | string[];
    excelStrings?: boolean;
    includeEmptyRows?: boolean;
    preserveNewLinesInValues?: boolean;
    withBOM?: boolean;
  }

  interface Callback {
    (error: Error, csv: string): void;
  }
}

declare function json2csv<T>(options: json2csv.Options<T>, callback: json2csv.Callback): void;
declare function json2csv<T>(options: json2csv.Options<T>): string;
declare function json2csv(options: json2csv.Options<{ [key: string]: string; }>, callback: json2csv.Callback): void;
declare function json2csv(options: json2csv.Options<{ [key: string]: string; }>): string;

export = json2csv;
