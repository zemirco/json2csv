declare namespace json2csv {
  interface IField {
    label?: string;
    value: string;
    default?: string;
  }

  interface IOptions {
    data: any[];
    fields?: (string | IField)[];
    filedNames?: string[];
    del?: string;
    defaultValue?: string;
    quotes?: string;
    doubleQuotes?: string;
    hasCSVColumnTitle?: boolean;
    eol?: string;
    newLine?: string;
    flatten?: boolean;
    excelStrings?: boolean;
  }

  interface ICallback {
    (error: Error, csv: string): void;
  }
  
  export function json2csv(options: IOptions, callback: ICallback): string;
}

export = json2csv.json2csv;
