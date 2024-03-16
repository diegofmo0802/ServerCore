/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el sistema de plantillas `.HSaml`.
 * @license Apache-2.0
 */

import FS from 'fs';
import Utilities from '../Utilities/Utilities';

class Template {
	static Expressions = {
		Variable: /\$\{(.+?)\}/ig,
		Object: {
			Block: /\$ ?\((.+)\) ?\{([^]+?)\}/g,
			Replaces: /\$(Key|Value)/g
		}
	};
	/**
	 * Carga y compila una plantilla `.HSaml`.
	 * @param {string} Path La ruta de la plantilla.
	 * @param {Object} Data Los datos con los que se compilara la plantilla.
	 * @returns {Promise<string>}
	 */
	static Load(Path, Data) {
		Path = Utilities.Path.Normalize(Path);
		return new Promise((PrResponse, PrError) => {
			FS.stat(Path, (Error, Details) => {
				if (Error) return PrError(Error.message);
				if (! (Details.isFile())) return PrError('La ruta no pertenece a una plantilla');
				FS.readFile(Path, (Error, Template) => {
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
		Content = Content.replace(this.Expressions.Variable, (Text, Name) => {
			if (Name && Name in Data) return Data[Name];
			else return Text;
		});
		Content = Content.replace(this.Expressions.Object.Block, (Text, Name, Loop) => {
			if (Name && Name in Data && typeof Data[Name] == 'object') {
				let Result = '';
				for (let Key in Data[Name]) {
					Result += Loop.replace(this.Expressions.Object.Replaces, (SubText, Type) => {
						if (Type == 'Key')   return Key;
						if (Type == 'Value') return Data[Name][Key];
					});
				}
				return Result;
			}
			else return Text;
		});
		return Content;
	}
}
export default Template;