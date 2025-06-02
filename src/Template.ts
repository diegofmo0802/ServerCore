/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Add the HSaml template engine to the server core.
 * @license Apache-2.0
 */

import FS from 'fs';
import Utilities from './Utilities/Utilities.js';

export class Template {
	/** Regular expressions used for parsing and processing the template. */
	private static expressions = {
		/** Regular expression for matching variables (e.g., `${variableName}`). */
		variable: /\$\{(.+?)\}/ig,
		object: {
			/** Regular expression for matching object/array blocks (e.g., `$(objectName) { ... }`). */
			block: /\$ ?\((.+)\) ?\{([^]+?)\}/g,
			/** Regular expression for matching placeholders within object/array blocks (e.g., `%key%`, `%value%`). */
			replaces: /\%(.+?)%/g
		}
	};
	/**
	 * Load and compile a template.
	 * This method reads a template file from the specified path,
	 * checks if it's a valid file, and then compiles its content
	 * using the provided data object.
	 *
	 * @example `Template.load('./templates/myTemplate.html', { username: 'John Doe' });`
	 * @param path - The path to the template file.
	 * @param data - The data used to compile the template.
	 * @returns The compiled template.
	 * @throws Error if the path is not a file.
	 * @throws Error if the file does not exist.
	 */
	public static async load(path: string, data: Template.dataObject): Promise<string> {
		path = Utilities.Path.normalize(path);
		const details = await FS.promises.stat(path);
		if (!details.isFile()) throw new Error('the path is not a template file');
		const template = await FS.promises.readFile(path);
		return this.compile(template.toString('utf-8'), data);
	}

	/**
	 * Compile a template.
	 * This internal method takes the raw template content and the data object
	 * and performs the actual compilation, replacing variables and processing
	 * object/array blocks according to the defined syntax.
	 *
	 * @example `Template.compile('Hello, ${name}!', { name: 'Alice' });`
	 * @param content - The content of the template.
	 * @param data - The data used to compile the template.
	 * @returns The compiled template.
	 * @throws Error if key and value names are equal in object blocks.
	 */
	private static compile(content: string, data: Template.dataObject): string {
		content = content.replace(this.expressions.variable, (text, name) => {
			return name && name in data ? data[name] : text;
		});
		content = content.replace(this.expressions.object.block, (block: string, sentence: string, loop: string) => {
			const [name, keyName = 'key', valueName = 'value'] = sentence.split(/, ?/gi);
			if (keyName === valueName) throw new Error('the key and value names must be different in block: ' + block);
			return name && name in data && data[name] instanceof Object ? Object.keys(data[name]).map((key) => {
				return loop.replace(this.expressions.object.replaces, (SubText, varName) => {
					if (keyName == varName) return key
					else if (valueName == varName) return data[name][key];
				});
			}).join('') : block;
		});
		return content;
	}
}

export namespace Template {
	/**
	 * Represents the structure of the data object used for template compilation.
	 * It is a key-value store where keys are strings and values can be of any type.
	 */
	export interface dataObject {
		[key: string]: any
	}
}

export default Template;
/*
Variables:      ${name}
Objects/Arrays: $(name) { the key is %key% and value %value% }
Objects/Arrays: $(name, customKeyName, customValueName) {
	the key is %customKeyName% and value %customValueName%
}
*/