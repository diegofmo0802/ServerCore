/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el sistema de plantillas `.HSaml`.
 * @license Apache-2.0
 */

import FS from 'fs';

class Template {
	static Expressions = {
		Variable: /(?<=\$Variable{)[^]*?(?=})/ig, //Completada
		Array: {
			Variable: /(?<=\$HSaml:Array{)[^]*?(?=})/ig, //Completada
			Format: /\s*?(?:<\/?HSaml:Array(?: .*)?>|\$HSaml:Array{.*?})\s*|(?: {4}|	)(?=<)/ig, //Completada
			Block: /<(HSaml:Array)(?: .*)?>[^]*?<\/\1(?: .*)?>/ig //Completada
		}
	};
	/**
	 * Carga y compila una plantilla `.HSaml`.
	 * @param {string} Patch La ruta de la plantilla.
	 * @param {Object} Data Los datos con los que se compilara la plantilla.
	 * @returns {Promise<string>}
	 */
	static Load(Patch, Data) {
		return new Promise((PrResponse, PrError) => {
			FS.stat(Patch, (Error, Details) => {
				if (Error) return PrError(Error.message);
				if (! (Details.isFile())) return PrError('La ruta no pertenece a una plantilla');
				FS.readFile(Patch, (Error, Template) => {
					if (Error) return PrError(Error.message);
					PrResponse(this.Compile(Template.toString(), Data));
				});
			});
		});
	}
	/**
	 * Compila una plantilla `.HSaml` a `Html`.
	 * @param {string} Content El contenido de la plantilla.
	 * @param {{}} Data Los datos con los que se compilara la plantilla.
	 * @returns {string}
	 */
	static Compile(Content, Data) {
		for (let ID in Data) {
			if (typeof Data[ID] !== 'object') {//@ts-ignore
				Content = Content.replaceAll(`$Variable{${ID}}`, Data[ID]);
			} else {
				Content = this.CompileOBJ(Content, ID, Data[ID]);
			}
		}
		return Content;
	}
	/**
	 * Compila la etiqueta <HSaml:Array>.
	 * @param {string} Content El Contenido del bloque.
	 * @param {(string|number)} Name El ID de los Datos.
	 * @param {Object} Data Los datos con los que se compilara la sub plantilla.
	 * @returns {string}
	 */
	static CompileOBJ(Content, Name, Data) {
		let Blocks = Content.match(this.Expressions.Array.Block);
		if (Blocks) for (let Block of Blocks) {
			let Variable = Block.match(this.Expressions.Array.Variable);
			if (Variable) if (Name == Variable[0]) {
				let Format = Block.replace(this.Expressions.Array.Format, '');
				let SubTemplate = '';
				for (let ID in Data) {//@ts-ignore
					SubTemplate += Format.replaceAll(
						`$Array{Valor}`, Data[ID]
					).replaceAll(`$Array{ID}`, ID);
				}//@ts-ignore
				Content = Content.replaceAll(Block, SubTemplate);
			}
		}
		return Content;
	};
}
export default Template;