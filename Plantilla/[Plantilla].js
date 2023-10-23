/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el sistema de plantillas `.HSaml`.
 * @license Saml
 * @module saml.server_core/Plantilla
 */

import FS from 'fs';

class Plantilla {
	static Expresiones = {
		Variable: /(?<=\$Variable{)[^]*?(?=})/ig, //Completada
		Array: {
			Variable: /(?<=\$HSaml:Array{)[^]*?(?=})/ig, //Completada
			Formato: /\s*?(?:<\/?HSaml:Array(?: .*)?>|\$HSaml:Array{.*?})\s*|(?: {4}|	)(?=<)/ig, //Completada
			Bloque: /<(HSaml:Array)(?: .*)?>[^]*?<\/\1(?: .*)?>/ig //Completada
		}
	};
	/**
	 * Carga y compila una plantilla `.HSaml`.
	 * @param {string} Ruta La ruta de la plantilla.
	 * @param {Object} Datos Los datos con los que se compilara la plantilla.
	 * @returns {Promise<string>}
	 */
	static Cargar(Ruta, Datos) {
		return new Promise((PrRespuesta, PrError) => {
			FS.stat(Ruta, (Error, Detalles) => {
				if (Error) return PrError(Error.message);
				if (! (Detalles.isFile)) return PrError('La ruta no pertenece a una plantilla');
				FS.readFile(Ruta, (Error, Plantilla) => {
					if (Error) return PrError(Error.message);
					PrRespuesta(this.Compilar(Plantilla.toString(), Datos));
				});
			});
		});
	}
	/**
	 * Compila una plantilla `.HSaml` a `Html`.
	 * @param {string} Contenido El contenido de la plantilla.
	 * @param {{}} Datos Los datos con los que se compilara la plantilla.
	 * @returns {string}
	 */
	static Compilar(Contenido, Datos) {
		for (let ID in Datos) {
			if (typeof Datos[ID] !== 'object') {
				Contenido = Contenido.replaceAll(`$Variable{${ID}}`, Datos[ID]);
			} else {
				/**
				 * Compila la etiqueta <HSaml:Array>.
				 * @param {(string|number)} Nombre El ID de los Datos.
				 * @param {Object} Datos Los datos con los que se compilara la sub plantilla.
				 * @returns {void}
				 */
				const CompilarOBJ = (Nombre, Datos) => {
					let Bloques = Contenido.match(this.Expresiones.Array.Bloque);
					if (Bloques) for (let Bloque of Bloques) {
						let Variable = Bloque.match(this.Expresiones.Array.Variable);
						if (Variable) if (Nombre == Variable[0]) {
							let Formato = Bloque.replace(this.Expresiones.Array.Formato, '');
							let SubPlantilla = '';
							for (let ID in Datos) {
								SubPlantilla += Formato.replaceAll(
									`$Array{Valor}`, Datos[ID]
								).replaceAll(`$Array{ID}`, ID);
							}
							Contenido = Contenido.replaceAll(Bloque, SubPlantilla);
						}
					}
				};
				CompilarOBJ(ID, Datos[ID]);
			}
		}
		return Contenido;
	}
}
export default Plantilla;