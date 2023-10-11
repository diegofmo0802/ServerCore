/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema básico de debug.
 * @license Saml
 * @module Saml/Debug
 */

import {WriteStream} from 'fs';

export namespace Debug {
	type Fecha = {
		Dia: string,
		Mes: string,
		Año: string,
		Hora: string,
		Minuto: string,
		Segundo: string,
		MiliSegundo: string,
		DDMMYYYY: string,
		HHMMSSmmm: string,
		Date: Date
	};
}

export class Debug {
	/**Contiene las instancias de Debug. */
	public static Debugs: Map<string,Debug>;
	/**Contiene el indicador `Mostrar todo en consola`. */
	public static MostrarTodo: boolean;
	/**Contiene el nombre del archivo `.DSaml`. */
	private Archivo: string;
	/**Contiene la ruta de la Carpeta de Debug. */
	private Carpeta: string;
	/**Contiene el indicador `Mostrar en consola`. */
	private EnConsola: boolean;
	/**Contiene la fecha en la que inicio el Debug. */
	private Fecha: Date;
	/**Contiene la ruta del archivo `.DSaml`. */
	private Ruta: string;
	/**Contiene el Stream del archivo `.DSaml`.*/
	private Stream: WriteStream;
	/**
	 * Crea/Recupera una instancia de Debug.
     * - Si no proporcionas una `"ID"` se devolverá la instancia por defecto.
     * - Si una instancia tiene el mismo `"ID"` que proporcionaste
     *   se devolverá como resultado de la creación de la instancia
     *   esto conlleva a que el campo `"Ruta"` sera descartado.
     * - Si no proporcionas una `"Ruta"` la ruta por defecto sera `".Debug"`.
	 * @param ID La ID de la instancia de debug.
	 * @param Ruta La Ruta de la carpeta donde se almacenaran los Log`s.
	 * @param EnConsola El indicador de `Mostrar en consola`.
	 */
	public constructor(ID?: string, Ruta?: string, EnConsola?: boolean);
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param Datos Los datos a mostrar y almacenar.
	 */
	public Log(...Datos: any): void
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param Datos Los datos a mostrar y almacenar.
	 */
	public static Log(...Datos: any): void
	/**
	 * Obtiene la fecha y hora actual y la formatea en formato DD-MM-AAAA:HH.MM.SS.mmm
	 */
	public static Fecha(): Debug.Fecha
}
export default Debug;