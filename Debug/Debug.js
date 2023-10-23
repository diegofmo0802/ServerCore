/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema básico de debug.
 * @license Saml
 * @module Saml/Debug
 */

import FS from 'fs';
import ConsoleUI from '../ConsoleUI/ConsoleUI.js';

class Debug {
	/**@type {Map<string,Debug>} Contiene las instancias de Debug. */
	static Debugs = new Map();
	/**@type {boolean} Contiene el indicador `Mostrar todo en consola`. */
	static MostrarTodo = false;
	/**@private @type {string} Contiene el nombre del archivo `.DSaml`. */
	Archivo = null;
	/**@private @type {string} Contiene la ruta de la Carpeta de Debug. */
	Carpeta = null;
	/**@type {boolean} Contiene el indicador `Mostrar en consola`. */
	EnConsola = null;
	/**@private @type {import('./Debug.js').Debug.Fecha} Contiene la fecha en la que inicio el Debug. */
	Fecha = null;
	/**@private @type {string} Contiene la ruta del archivo `.DSaml`. */
	Ruta = null;
	/**@type {FS.WriteStream} Contiene el Stream del archivo `.DSaml`.*/
	Stream = null;
	/**
	 * Crea/Recupera una instancia de Debug.
	 * @param {string} ID La ID de la instancia de debug.
	 * @param {string} Ruta La Ruta de la carpeta donde se almacenaran los Log`s.
	 * @param {boolean?} EnConsola El indicador de `Mostrar en consola`.
	 */
	constructor(ID = '_Debug', Ruta = '.Debug', EnConsola = true) {
		if (ID === null)        ID = '_Debug';
		if (Ruta === null)      Ruta = '.Debug';
		if (EnConsola === null) EnConsola = false;
		if (Debug.Debugs.has(ID)) return Debug.Debugs.get(ID);
		Ruta = Ruta.startsWith('/') ? Ruta.slice(1) : Ruta;
		Ruta = Ruta.endsWith('/') ? Ruta.slice(0, -1) : Ruta;
		this.EnConsola = EnConsola;
		this.Fecha = Debug.Fecha();
		this.Archivo = `[${ID}] ${this.Fecha.Hora}.${this.Fecha.Minuto}.${this.Fecha.Segundo}.${this.Fecha.MiliSegundo}.DSaml`;
		this.Carpeta = `${Ruta}/[${this.Fecha.Dia}.${this.Fecha.Mes}.${this.Fecha.Año}]`;
		this.Ruta = `${this.Carpeta}/${this.Archivo}`;
		/*console.log(
			ID, this.Archivo, this.Carpeta, this.Ruta
		)*/
		if (! (FS.existsSync(this.Carpeta))) FS.mkdirSync(this.Carpeta, {recursive: true});
		this.Stream = FS.createWriteStream(this.Ruta, 'utf8');
		this.Stream.write('/*+----------------------------+*/\n');
		this.Stream.write('/*| Saml/Debug by diegofmo0802 |*/\n');
		this.Stream.write('/*|     Use Saml ReadDebug     |*/\n');
		this.Stream.write('/*+----------------------------+*/\n');
		Debug.Debugs.set(ID, this);
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Datos Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	Log(...Datos) {
		let Fecha = Debug.Fecha();
		let Prefijo = `[${Fecha.Hora}:${Fecha.Minuto}:${Fecha.Segundo}:${Fecha.MiliSegundo}]`;
		if (! (this.Stream.destroyed)) this.Stream.write(`${Prefijo} -> ${JSON.stringify((() => {
			let Resultado = [];
			Datos.forEach((Dato) => {
				if (typeof Dato === 'string') Resultado.push(ConsoleUI.Color_limpiar(Dato));
				else Resultado.push(Dato);
			});
			return Resultado;
		})())}\n`);
		if (this.EnConsola || Debug.MostrarTodo) console.log(
			ConsoleUI.Color(`&B(255,0,0)&C(255,255,0)${Prefijo}&R`),
			...(() => {
				let Resultado = [];
				Datos.forEach((Dato) => {
					if (typeof Dato === 'string') Resultado.push(ConsoleUI.Color(Dato));
					else Resultado.push(Dato);
				});
				return Resultado;
			})()
		);
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Datos Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	static Log(...Datos) {
		if (! (this.Debugs.has('_Debug'))) new Debug();
		this.Debugs.get('_Debug').Log(...Datos);
	}
	/**
	 * Obtiene la fecha y hora actual y la formatea en formato DD-MM-AAAA:HH.MM.SS.mmm
	 * @returns {import('./Debug.js').Debug.Fecha}
	 */
	static Fecha() {
		let Fecha = new Date;
		let [Dia, Mes, Año, Hora, Minuto, Segundo, MiliSegundo] = [
			Fecha.getDate()        .toString().padStart(2, '0'),
			(Fecha.getMonth() + 1) .toString().padStart(2, '0'),
			Fecha.getFullYear()    .toString().padStart(4, '0'),
			Fecha.getHours()       .toString().padStart(2, '0'),
			Fecha.getMinutes()     .toString().padStart(2, '0'),
			Fecha.getSeconds()     .toString().padStart(2, '0'),
			Fecha.getMilliseconds().toString().padStart(3, '0')
		];
		let DDMMYYYY = `${Dia}-${Mes}-${Año}`;
		let HHMMSSmmm = `${Hora}.${Minuto}.${Segundo}.${MiliSegundo}`;
		return {
			Dia: Dia,
			Mes: Mes,
			Año: Año,
			Hora: Hora,
			Minuto: Minuto,
			Segundo: Segundo,
			MiliSegundo: MiliSegundo,
			DDMMYYYY: DDMMYYYY,
			HHMMSSmmm: HHMMSSmmm,
			Date: Fecha
		};
	}
}
export default Debug;