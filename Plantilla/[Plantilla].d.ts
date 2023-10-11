/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el sistema de plantillas `.HSaml`.
 * @license Saml
 * @module saml.server_core/Plantilla
 */

export class Plantilla {
    /**Contiene las expresiones regulares que ayudan al tratamiento de las plantillas */
	private static Expresiones: {
		Variable: RegExp,
		Array: {
			Variable: RegExp,
			Formato: RegExp,
			Bloque: RegExp,
		}
	};
	/**
	 * Carga y compila una plantilla `HSaml` desde un archivo.
	 * @param Ruta La ruta de la plantilla.
	 * @param Datos Los datos con los que se compilara la plantilla.
	 */
	public static Cargar(Ruta: string, Datos: object): Promise<string>
	/**
	 * Compila una plantilla `.HSaml` a `Html`.
	 * @param {string} Contenido El contenido de la plantilla.
	 * @param {{}} Datos Los datos con los que se compilara la plantilla.
	 * @returns {string}
	 */
	public static Compilar(Contenido: string, Datos: object): string;
}
export default Plantilla;