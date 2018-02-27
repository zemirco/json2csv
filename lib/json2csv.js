import Parser from './JSON2CSVParser';
import Transform from './JSON2CSVTransform';

export { Parser };
export { Transform };

// Convenience method to keep the API similar to version 3.X
export function parse(data, opts) {
	return new Parser(opts).parse(data)
}
