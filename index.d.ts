declare module 'json2csv' {
  interface CSVCallback {
    (error: Error, csv: string): void;
  }

  function json2csv(options: any, callback: CSVCallback): string;
  export = json2csv;
}
