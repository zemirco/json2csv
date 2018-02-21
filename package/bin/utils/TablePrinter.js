'use strict';

const Table = require('cli-table2');

const MIN_CELL_WIDTH = 15;

class TablePrinter {
  constructor(params) {
    this.params = params;
    this._hasWritten = false;
    this.colWidths;
  }

  push(csv) {
    const lines = csv.split(this.params.eol);

    const chars = {
        'bottom': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': ''
      };
    if (!this._hasWritten) {
      this.colWidths = this.getColumnWidths(lines[0]);
      if (this.params.header) {
        const head = lines.shift().split(this.params.delimiter);    
        const table = new Table({ head, colWidths: this.colWidths, chars });
        this.print(table, []);
        this._hasWritten = true;
      }
    } else {
      chars['top-left'] = '├';
      chars['top-mid'] = '┼';
      chars['top-right'] = '┤';
    }

    if (!lines.length) return;

    const table = new Table({ colWidths: this.colWidths, chars });
    this.print(table, lines);
    this._hasWritten = true;
  }

  end(csv) {
    const lines = csv.split(this.params.eol);
    const chars = { 'top-left': '├' , 'top-mid': '┼', 'top-right': '┤' };
    const table = new Table({ colWidths: this.colWidths, chars });
    this.print(table, lines);
  }

  printCSV(csv) {
    let lines = csv.split(this.params.eol);

    this.colWidths = this.getColumnWidths(lines[0]);
    const head = this.params.header
      ? lines.shift().split(this.params.delimiter)
      : undefined;
    
    const table = new Table(head
      ? { head, colWidths: this.colWidths }
      : { colWidths: this.colWidths });

    this.print(table, lines);
  }

  getColumnWidths(line) {
    return line
      .split(this.params.delimiter)
      .map(elem => Math.max(elem.length * 2, MIN_CELL_WIDTH));
  }

  print(table, lines) {
    lines.forEach(line => table.push(line.split(this.params.delimiter)));
    // eslint-disable-next-line no-console
    console.log(table.toString());  
  }
}

module.exports = TablePrinter;