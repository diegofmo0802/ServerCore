/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema básico de debug.
 * @license Apache-2.0
 */

import FS from 'fs';
import ConsoleUI from '../ConsoleUI/ConsoleUI.js';

class Debug {
	/**@type {Map<string,Debug>} Contiene las instancias de Debug. */
	static Debugs = new Map();
	/**@type {boolean} Contiene el indicador `Mostrar todo en consola`. */
	static ShowAll = false;
	/**@private @type {string} Contiene el nombre del archivo `.DSaml`. */
	File = null;
	/**@private @type {string} Contiene la ruta de la Carpeta de Debug. */
	Folder = null;
	/**@type {boolean} Contiene el indicador `Mostrar en consola`. */
	InConsole = null;
	/**@private @type {import('./Debug.js').Debug.StartDate} Contiene la fecha en la que inicio el Debug. */
	StartDate = null;
	/**@private @type {string} Contiene la ruta del archivo `.DSaml`. */
	Path = null;
	/**@type {FS.WriteStream} Contiene el Stream del archivo `.DSaml`.*/
	Stream = null;
	/**
	 * Crea/Recupera una instancia de Debug.
	 * @param {string} ID La ID de la instancia de debug.
	 * @param {string} Path La Ruta de la carpeta donde se almacenaran los Log`s.
	 * @param {boolean?} InConsole El indicador de `Mostrar en consola`.
	 */
	constructor(ID = '_Debug', Path = '.Debug', InConsole = true) {
		if (ID === null)        ID = '_Debug';
		if (Path === null)      Path = '.Debug';
		if (InConsole === null) InConsole = false;
		if (Debug.Debugs.has(ID)) return Debug.Debugs.get(ID);
		Path = Path.startsWith('/') ? Path.slice(1) : Path;
		Path = Path.endsWith('/') ? Path.slice(0, -1) : Path;
		this.InConsole = InConsole;
		this.StartDate = Debug.GetDate();
		this.File = `[${ID}] ${this.StartDate.Hour}.${this.StartDate.Minute}.${this.StartDate.Second}.${this.StartDate.MiliSecond}.DSaml`;
		this.Folder = `${Path}/[${this.StartDate.Day}.${this.StartDate.Month}.${this.StartDate.Year}]`;
		this.Path = `${this.Folder}/${this.File}`;
		if (! (FS.existsSync(this.Folder))) FS.mkdirSync(this.Folder, { recursive: true });
		this.Stream = FS.createWriteStream(this.Path, 'utf8');
		this.Stream.write('/*+----------------------------+*/\n');
		this.Stream.write('/*| Saml/Debug by diegofmo0802 |*/\n');
		this.Stream.write('/*|     Use Saml ReadDebug     |*/\n');
		this.Stream.write('/*+----------------------------+*/\n');
		Debug.Debugs.set(ID, this);
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Data Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	Log(...Data) {
		let ActDate = Debug.GetDate();
		let Prefix = `[${ActDate.Hour}:${ActDate.Minute}:${ActDate.Second}:${ActDate.MiliSecond}]`;
		if (! (this.Stream.destroyed)) this.Stream.write(`${Prefix} -> ${JSON.stringify((() => {
			let Result = [];
			Data.forEach((Datum) => {
				if (typeof Datum === 'string') Result.push(ConsoleUI.CleanFormat(Datum));
				else Result.push(Datum);
			});
			return Result;
		})())}\n`);
		if (this.InConsole || Debug.ShowAll) console.log(
			ConsoleUI.GenerateFormat(`&B(255,0,0)&C(255,255,0)${Prefix}&R`),
			...(() => {
				let Result = [];
				Data.forEach((Datum) => {
					if (typeof Datum === 'string') Result.push(ConsoleUI.GenerateFormat(Datum));
					else Result.push(Datum);
				});
				return Result;
			})()
		);
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Data Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	static Log(...Data) {
		if (! (this.Debugs.has('_Debug'))) new Debug();
		this.Debugs.get('_Debug').Log(...Data);
	}
	/**
	 * Obtiene la fecha y hora actual y la formatea en formato DD-MM-AAAA:HH.MM.SS.mmm
	 * @returns {import('./Debug.js').Debug.StartDate}
	 */
	static GetDate() {
		let ActDate = new Date;
		let [Day, Month, Year, Hour, Minute, Second, MiliSecond] = [
			ActDate.getDate()        .toString().padStart(2, '0'),
			(ActDate.getMonth() + 1) .toString().padStart(2, '0'),
			ActDate.getFullYear()    .toString().padStart(4, '0'),
			ActDate.getHours()       .toString().padStart(2, '0'),
			ActDate.getMinutes()     .toString().padStart(2, '0'),
			ActDate.getSeconds()     .toString().padStart(2, '0'),
			ActDate.getMilliseconds().toString().padStart(3, '0')
		];
		let DDMMYYYY = `${Day}-${Month}-${Year}`;
		let HHMMSSmmm = `${Hour}.${Minute}.${Second}.${MiliSecond}`;
		return {
			Day: Day,
			Month: Month,
			Year: Year,
			Hour: Hour,
			Minute: Minute,
			Second: Second,
			MiliSecond: MiliSecond,
			DDMMYYYY: DDMMYYYY,
			HHMMSSmmm: HHMMSSmmm,
			Date: ActDate
		};
	}
}
export default Debug;