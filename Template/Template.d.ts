/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el sistema de plantillas `.HSaml`.
 * @license Apache-2.0
 */

export class Template {
    /**Contiene las expresiones regulares que ayudan al tratamiento de las plantillas */
	private static Expresiones: {
		Variable: RegExp,
		Object: {
			Block: RegExp,
			Replaces: RegExp
		}
	};
	/**
	 * Carga y compila una plantilla `HSaml` desde un archivo.
	 * @param Path La ruta de la plantilla.
	 * @param Data Los datos con los que se compilara la plantilla.
	 */
	public static Load(Path: string, Data: object): Promise<string>
	/**
	 * Compila una plantilla `.HSaml` a `Html`.
	 * @param {string} Content El contenido de la plantilla.
	 * @param {{}} Data Los datos con los que se compilara la plantilla.
	 * @returns {string}
	 */
	private static Compile(Content: string, Data: object): string;
}
export default Template;