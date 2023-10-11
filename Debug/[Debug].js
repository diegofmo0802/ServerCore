/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema básico de debug.
 * @license Saml
 * @module Saml/Debug
 */

import FS from 'fs';

export default class Debug {
	/**@type {Map<string,Debug>} Contiene las instancias de Debug. */
	static Debugs = new Map();
	/**@type {boolean} Contiene el indicador `Mostrar todo en consola`. */
	static Mostrar_Todo = false;
	/**@private @type {string} Contiene el nombre del archivo `.DSaml`. */
	Archivo = null;
	/**@private @type {string} Contiene la ruta de la Carpeta de Debug. */
	Carpeta = null;
	/**@type {boolean} Contiene el indicador `Mostrar en consola`. */
	Consola = null;
	/**@private @type {Date} Contiene la fecha en la que inicio el Debug. */
	Fecha = null;
	/**@private @type {string} Contiene el identificador de el Debug. */
	ID = null;
	/**@private @type {string} Contiene la ruta del archivo `.DSaml`. */
	Ruta = null;
	/**@type {FS.WriteStream} Contiene el Stream del archivo `.DSaml`.*/
	Stream = null;
	/**
	 * Crea/Recupera una instancia de Debug.
	 * @param {string} Ruta La Ruta de la carpeta donde se almacenaran los Log`s.
	 * @param {string} ID La ID de la instancia de debug.
	 * @param {boolean?} Consola El indicador de `Mostrar en consola`.
	 */
	constructor(Ruta, ID, Consola = null) {
		if (Debug.Debugs.has(ID)) return Debug.Debugs.get('_Debug');
		Debug.Debugs.set(ID, this);
		Ruta = Ruta.startsWith('/') ? Ruta.slice(1) : Ruta;
		Ruta = Ruta.endsWith('/') ? Ruta.slice(0, -1) : Ruta;
		this.Consola = console ? Consola : false;
		this.Fecha = new Date;
		this.Archivo = `[${ID}] ${this.Fecha.getHours()}-${this.Fecha.getMinutes()}-${this.Fecha.getSeconds()}-${this.Fecha.getMilliseconds()}.DSaml`;
		this.Carpeta = `${Ruta}/[${this.Fecha.getDate()}-${this.Fecha.getMonth() + 1}-${this.Fecha.getFullYear()}]`;
		this.ID = ID;
		this.Ruta = `${this.Carpeta}/${this.Archivo}`;
		//if (!(FS.existsSync(Ruta))) FS.mkdirSync(Ruta);
		if (!(FS.existsSync(this.Carpeta))) FS.mkdirSync(this.Carpeta, {recursive: true});
		this.Stream = FS.createWriteStream(this.Ruta, 'utf-8');
		this.Stream.write('/*------------------------------*/\n');
		this.Stream.write('/*- Saml/Debug by diegofmo0802 -*/\n');
		this.Stream.write('/*-     Use Saml ReadDebug     -*/\n');
		this.Stream.write('/*------------------------------*/\n');
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Datos Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	Log(...Datos) {
		let Fecha = new Date;
		let Prefijo = `[${Fecha.getHours()}:${Fecha.getMinutes()}:${Fecha.getSeconds()}:${Fecha.getMilliseconds()}]`;
		if (!(this.Stream.destroyed)) this.Stream.write(`${Prefijo} -> ${JSON.stringify(Datos)}\n`);
		if (this.Consola || Debug.Mostrar_Todo) console.log(Prefijo, ...Datos);
	}
	/**
	 * Muestra y almacena datos en la consola y en ´.DSaml´.
	 * @param {any} Datos Los datos a mostrar y almacenar.
	 * @returns {void}
	 */
	static Log(...Datos) {
		if (!(this.Debugs.has('_Debug'))) this.Debugs.set('Debug', new Debug('.Debug', '_Debug', true));
		this.Debugs.get('_Debug').Log(...Datos);
	}
}