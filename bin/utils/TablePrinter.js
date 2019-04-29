'use strict';

const MIN_CELL_WIDTH = 15;

class TablePrinter {
  constructor(opts) {
    this.opts = opts;
    this._hasWritten = false;
  }

  push(csv) {
    const lines = csv.split(this.opts.eol);

    if (!lines.length) return;

    if (!this._hasWritten) this.setColumnWidths(lines[0]);

    const top = this._hasWritten ? this.middleLine : this.topLine;
    this.print(top, lines);
    this._hasWritten = true;
  }

  end(csv) {
    let lines = csv.split(this.opts.eol);
    if (!this._hasWritten) this.setColumnWidths(lines[0]);
    const top = this._hasWritten ? this.middleLine : this.topLine;
    this.print(top, lines, this.bottomLine);
  }

  printCSV(csv) {
    this.end(csv);
  }

  setColumnWidths(line) {
    this.colWidths = line
      .split(this.opts.delimiter)
      .map(elem => Math.max(elem.length * 2, MIN_CELL_WIDTH));

    this.topLine = `┌${this.colWidths.map(i => '─'.repeat(i)).join('┬')}┐`;
    this.middleLine = `├${this.colWidths.map(i => '─'.repeat(i)).join('┼')}┤`;
    this.bottomLine = `└${this.colWidths.map(i => '─'.repeat(i)).join('┴')}┘`;
  }

  print(top, lines, bottom) {
    const table = `${top}\n`
      + lines
        .map(row => this.formatRow(row))
        .join(`\n${this.middleLine}\n`)
      + (bottom ? `\n${bottom}` : '');

    // eslint-disable-next-line no-console
    console.log(table);  
  }

  formatRow(row) {
    const wrappedRow = row
      .split(this.opts.delimiter)
      .map((cell, i) => cell.match(new RegExp(`(.{1,${this.colWidths[i] - 2}})`, 'g')) || []);

    const height = wrappedRow.reduce((acc, cell) => Math.max(acc, cell.length), 0);

    const processedCells = wrappedRow
      .map((cell, i) => this.formatCell(cell, height, this.colWidths[i]));

    return Array(height).fill('')
      .map((_, i) => `│${processedCells.map(cell => cell[i]).join('│')}│`)
      .join('\n');
  }

  formatCell(content, heigth, width) {
    const paddedContent = this.padCellHorizontally(content, width);
    return this.padCellVertically(paddedContent, heigth, width);
  }

  padCellVertically(content, heigth, width) {
    const vertPad = heigth - content.length;
    const vertPadTop = Math.ceil(vertPad / 2);
    const vertPadBottom = vertPad - vertPadTop;
    const emptyLine = ' '.repeat(width);

    return [
      ...Array(vertPadTop).fill(emptyLine),
      ...content,
      ...Array(vertPadBottom).fill(emptyLine)
    ];
  }

  padCellHorizontally(content, width) {
    return content.map((line) => {
      const horPad = width - line.length - 2;
      return ` ${line}${' '.repeat(horPad)} `;
    });
  }
}

module.exports = TablePrinter;