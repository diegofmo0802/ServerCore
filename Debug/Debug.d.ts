/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema básico de debug.
 * @license Apache-2.0
 */

import { WriteStream } from 'fs';

export namespace Debug {
	type Debugs = Map<string, Debug>;
	type ActDate = {
		Day: string,
		Month: string,
		Year: string,
		Hour: string,
		Minute: string,
		Second: string,
		MiliSecond: string,
		DDMMYYYY: string,
		HHMMSSmmm: string,
		Date: Date
	};
}

export class Debug {
	/**Contiene las instancias de Debug. */
	public static Debugs: Debug.Debugs;
	/**Contiene el indicador `Mostrar todo en consola`. */
	public static ShowAll: boolean;
	/**El ID de la instancia de Debug. */
	private ID: string;
	/**Contiene el nombre del archivo `.DSaml`. */
	private File: string;
	/**Contiene la ruta de la Carpeta de Debug. */
	private Folder: string;
	/**Contiene el indicador `Mostrar en consola`. */
	private InConsole: boolean;
	/**Contiene la fecha en la que inicio el Debug. */
	private StartDate: Debug.Date;
	/**Contiene la ruta del archivo `.DSaml`. */
	private Path: string;
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
	 * @param Path La Ruta de la carpeta donde se almacenaran los Log`s.
	 * @param InConsole El indicador de `Mostrar en consola`.
	 */
	public constructor(ID?: string, Path?: string, InConsole?: boolean, InFile?: boolean);
	/** Crea el stream para el Debug. */
	private InitStream(): void;
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param Data Los datos a mostrar y almacenar.
	 */
	public Log(...Data: any): void
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param Data Los datos a mostrar y almacenar.
	 */
	public static Log(...Data: any): void
	/**
	 * Obtiene la fecha y hora actual y la formatea en formato DD-MM-AAAA:HH.MM.SS.mmm
	 */
	private static GetDate(): Debug.ActDate
}
export default Debug;