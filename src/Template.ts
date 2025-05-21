/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Add the HSaml template engine to the server core.
 * @license Apache-2.0
 */

import FS from 'fs';
import Utilities from './Utilities/Utilities.js';

export class Template {
	/** Regular expressions used to compile the template */
	private static expressions = {
		variable: /\$\{(.+?)\}/ig,
		object: {
			block: /\$ ?\((.+)\) ?\{([^]+?)\}/g,
			replaces: /\%(.+?)%/g
		}
	};
	/**
	 * Load and compile a template.
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
	 * @param Content - The content of the template.
	 * @param data - The data used to compile the template.
	 * @returns The compiled template.
	 * @throws Error if key and value names are equal in object blocks.
	 */
	private static compile(Content: string, data: Template.dataObject): string {
		Content = Content.replace(this.expressions.variable, (text, name) => {
			return name && name in data ? data[name] : text;
		});
		Content = Content.replace(this.expressions.object.block, (block: string, sentence: string, loop: string) => {
			const [name, keyName = 'key', valueName = 'value'] = sentence.split(/, ?/gi);
			if (keyName === valueName) throw new Error('the key and value names must be different in block: ' + block);
			return name && name in data && data[name] instanceof Object ? Object.keys(data[name]).map((key) => {
				return loop.replace(this.expressions.object.replaces, (SubText, varName) => {
					if (keyName == varName) return key
					else if (valueName == varName) return data[name][key];
				});
			}).join('') : block;
		});
		return Content;
	}
}

export namespace Template {
	export interface dataObject {
		[key: string]: any
	}
}

export default Template;
/*
Variables:      ${name}
Objects/Arrays: $(name, keyName, valueName) { the key is $keyName and value $valueName }
Objects/Arrays: $(name) { the key is %key% and value %value% }
Objects/Arrays: $(name, customKeyName, customValueName) {
	the key is %customKeyName% and value %customValueName%
}
*/