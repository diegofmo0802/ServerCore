/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description add the HSaml template engine to the server core.
 * @license Apache-2.0
 */

import FS from 'fs';
import Utilities from './Utilities.js';

export class Template {
	/** regular expressions for compile the template */
	private static expressions = {
		variable: /\$\{(.+?)\}/ig,
		object: {
			block: /\$ ?\((.+)\) ?\{([^]+?)\}/g,
			replaces: /\%(.+?)%/g
		}
	};
	/**
	 * load and compile a template
	 * @param path the path to the template
	 * @param data the data to compile the template
	 * @returns the compiled template
	 * @throws an error if the path is not a template file
	 * @throws an error if the template file does not exist
	 */
	public static async load(path: string, data: Template.dataObject): Promise<string> {
		path = Utilities.Path.normalize(path);
		const details = await FS.promises.stat(path);
		if (!details.isFile()) throw new Error('the path is not a template file');
		const template = await FS.promises.readFile(path);
		return this.compile(template.toString('utf-8'), data);
	}
	/**
	 * compile a template
	 * @param Content the content of the template
	 * @param data the data to compile the template
	 * @returns the compiled template
	 * @private
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
variables:     ${name}
Objetos/Arrays: $(name, keyName, valueName) { the key is $keyName and value $valueName } 
Objetos/Arrays: $(name) { the key is %key% and value %value% } 
Objetos/Arrays: $(name, customKeyName, customValueName) {
	the key is %customKeyName% and value %customValueName%
} 

*/