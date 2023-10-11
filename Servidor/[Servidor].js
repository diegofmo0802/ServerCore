/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade una forma sencilla de crear servidores HTTP/S y WS/S.
 * @license Saml
 * @module Saml/Server-core
 */

import FS from 'fs';
import HTTP from 'http';
import HTTPS from 'https';
import Debug from '../Debug/[Debug].js';

import Petición from "../Servidor/Petición.js";
import Respuesta from "../Servidor/Respuesta.js";
import Sesión from "../Servidor/Sesión.js";
import WebSocket from "../Servidor/WebSocket.js";

const _Peticiones = new Debug('.Debug/Peticiones', 'Peticiones', false);
const _Solicitudes = new Debug('.Debug/Solicitudes', 'Solicitudes', false);

export default class Servidor {
	/**@type {typeof import('../Tipo').Saml.Servidor.Petición} */
	static Petición = Petición;
	/**@type {typeof import('../Tipo').Saml.Servidor.Respuesta} */
	static Respuesta = Respuesta;
	/**@type {typeof import('../Tipo').Saml.Servidor.Sesión} */
	static Sesión = Sesión;
	/**@type {typeof import('../Tipo').Saml.Servidor.WebSocket} */
	static WebSocket = WebSocket;
	/**@type {string} Contiene el host donde el servidor recibirá peticiones. */
	Host = null;
	/**@type {import('../Tipo').Saml.Servidor.Plantillas} Contiene el listado de plantillas de respuesta del servidor. */
	Plantillas = null;
	/**@type {('HTTP'|'HTTPS'|'HTTP/S')} El protocolo en el que se esta ejecutando el servidor. */
	Protocolo = null;
	/**@type {number} Contiene el puerto donde el servidor recibirá peticiones HTTP. */
	PuertoHTTP = null;
	/**@type {number} Contiene el puerto donde el servidor recibirá peticiones HTTPS. */
	PuertoHTTPS = null;
	/**@type {HTTP.Server} Contiene el servidor HTTP/S. */
	ServidorHTTP = null;
	/**@type {HTTPS.Server} Contiene el servidor HTTP/S. */
	ServidorHTTPS = null;
	/**@type {Array<import('../Tipo').Saml.Servidor.Reglas>} Contiene las reglas de enrutamiento del servidor. */
	Reglas = null;
	/**
	 * Crea un servidor HTTP/S.
	 * @param {number?} Puerto El puerto donde el servidor recibirá peticiones.
	 * @param {string?} Host El host donde el servidor recibirá peticiones.
	 * @param {{Publico: string, Llave: string, Puerto?: number}} SSL La configuración SSL.
	 */
	constructor(Puerto = null, Host = null, SSL = null) {
		this.Host = Host ? Host : null;
		this.Plantillas = {};
		this.PuertoHTTP = Puerto ? Puerto : 80;
		this.PuertoHTTPS = SSL && SSL.Puerto ? SSL.Puerto : 443;
		this.Reglas = [];
		this.ServidorHTTP = HTTP.createServer((Petición, Respuesta) => {
			this.Peticiones(Petición, Respuesta);
		}).on('upgrade', (Petición, Socket) => {
			this.Solicitudes(Petición, Socket);
		}).listen(this.PuertoHTTP, Host, () => {
			this.Protocolo = 'HTTP';
			Debug.Log('---------------------------------');
			Debug.Log('- Saml/Servidor by diegofmo0802 -');
			Debug.Log('-       Servidor Iniciado       -');
			Debug.Log('---------------------------------');
			Debug.Log('- Host', this.Host ? this.Host : 'localhost');
			Debug.Log('- Puerto HTTP', this.PuertoHTTP);
			Debug.Log('- Puerto HTTPS?', this.PuertoHTTPS);
			Debug.Log('- Protocolo: ', this.Protocolo);
			Debug.Log('---------------------------------');
		});
		if (SSL && SSL.Publico && SSL.Llave) {
			Servidor.Certificados(SSL.Publico, SSL.Llave).then((Certificados) => {
				this.ServidorHTTPS = HTTPS.createServer(Certificados, (Petición, Respuesta) => {
					this.Peticiones(Petición, Respuesta);
				}).on('upgrade', (Petición, Socket) => {
					this.Solicitudes(Petición, Socket);
				}).listen(this.PuertoHTTPS, Host, () => {
					Debug.Log('[Server - Core]: Protocolo HTTPS Iniciado');
					this.Protocolo = this.Protocolo == 'HTTP' ? 'HTTP/S' : 'HTTPS';
				});
			}).catch((Error) => {
				Debug.Log('[Server - Core]: Error con los certificados: ', Error);
			});
		}
		this.Reglas.push({
			Método: 'GET', Tipo: 'Carpeta', Url: '/Saml:Global', Opciones: {
				Recurso: 'Saml/Global'
			}
		});
	}
	/**
	 * Añade una/varias regla/s de enrutamiento para el servidor.
	 * @param {Array<import('../../Saml/Tipo').Saml.Servidor.Reglas>} Reglas La regla/s que desea añadir.
	 * @returns {Servidor}
	 */
	Añadir_Reglas(...Reglas) {
		this.Reglas = this.Reglas.concat(Reglas);
		return this;
	}
	/**
	 * Define la plantillas `.HSaml` predeterminadas del servidor.
	 * @param {keyof import('../Tipo').Saml.Servidor.Plantillas} Nombre El nombre de la plantilla.
	 * @param {string} Ruta La ruta de la plantilla `.HSaml`.
	 * @returns {Servidor}
	 */
	Definir_Plantillas(Nombre, Ruta) {
		this.Plantillas[Nombre] = Ruta;
		return this;
	}
	/**
	 * Enruta las peticiones hechas al servidor para que sean procesadas.
	 * @param {import('../Tipo').Saml.Servidor.Petición} Petición La petición que recibió el servidor.
	 * @param {import('../Tipo').Saml.Servidor.Respuesta} Respuesta La respuesta que dará el servidor.
	 * @returns {void}
	 */
	Enrutar(Petición, Respuesta) {
		let Enrutado = false;
		for (let Regla of this.Reglas) {
			Regla.Url = Regla.Url.startsWith('/') ? Regla.Url : '/' + Regla.Url;
			Regla.Url = Regla.Url.endsWith('/') ? Regla.Url : Regla.Url + '/';
			Enrutado = Regla.Método == 'ALL'
			|| Regla.Método == Petición.Método
			? Regla.Tipo == 'Acción'
				? Regla.Opciones.Cobertura == 'Completa'
					? Regla.Url.length <= Petición.Url.length
					&& Regla.Url == Petición.Url.slice(0, Regla.Url.length)
					? true : false
					: Regla.Url == Petición.Url
					? true : false
				: Regla.Tipo == 'Archivo'
					? Regla.Opciones.Cobertura == 'Completa'
					? Regla.Url.length <= Petición.Url.length
						&& Regla.Url == Petición.Url.slice(0, Regla.Url.length)
						? true : false
					: Regla.Url == Petición.Url
						? true : false
					: Regla.Tipo == 'Carpeta'
					? Regla.Url.length <= Petición.Url.length
						&& Regla.Url == Petición.Url.slice(0, Regla.Url.length)
						? true : false
					: false
			: false;
			/**
			 * Tener en cuenta para simplificar
			Enrutado = (Regla.Método == 'ALL' || Regla.Método == Petición.Método)
           	&& (
           	  	(Regla.Tipo == 'Acción' && (
           	  	  	(Regla.Opciones.Cobertura == 'Completa' && Regla.Url.length <= Petición.Url.length && Regla.Url == Petición.Url.slice(0, Regla.Url.length)) ||
           	  	  	(Regla.Url == Petición.Url)
           	  	)) ||
           	  	(Regla.Tipo == 'Archivo' && (
           	  	  	(Regla.Opciones.Cobertura == 'Completa' && Regla.Url.length <= Petición.Url.length && Regla.Url == Petición.Url.slice(0, Regla.Url.length)) ||
           	  	  	(Regla.Url == Petición.Url)
           	  	)) ||
           	  	(Regla.Tipo == 'Carpeta' && Regla.Url.length <= Petición.Url.length && Regla.Url == Petición.Url.slice(0, Regla.Url.length))
           	);
			*/

			if (Enrutado) {
				switch(Regla.Tipo) {
					case 'Acción': Regla.Opciones.Acción(Petición, Respuesta); break;
					case 'Archivo': Respuesta.EnviarArchivo(Regla.Opciones.Recurso); break;
					case 'Carpeta': Respuesta.EnviarCarpeta(Regla, Petición); break;
				}
				break;
			}
		}
		if (!(Enrutado)) Respuesta.Error(500, `Sin enrutador para: ${Petición.Método} -> ${Petición.Url}`);
	}
	/**
	 * Enruta las peticiones de conexión WebSocket.
	 * @param {import('../Tipo').Saml.Servidor.Petición} Petición La petición que recibió el servidor.
	 * @param {import('../Tipo').Saml.Servidor.WebSocket} WebSocket La conexión con el cliente.
	 * @returns {void}
	 */
	EnrutarWebSocket(Petición, WebSocket) {
		let Enrutado = false;
		for (let Regla of this.Reglas) {
			Regla.Url = Regla.Url.startsWith('/') ? Regla.Url : '/' + Regla.Url;
			Regla.Url = Regla.Url.endsWith('/') ? Regla.Url : Regla.Url + '/';
			Enrutado = Regla.Método == 'ALL'
			|| Regla.Método == Petición.Método
			? Regla.Tipo == 'WebSocket'
				? Regla.Opciones.Cobertura == 'Completa'
					? Regla.Url.length <= Petición.Url.length
					&& Regla.Url == Petición.Url.slice(0, Regla.Url.length)
						? true : false
					: Regla.Url == Petición.Url
						? true : false
				: false
			: false;
			if (Enrutado) {
				let Llave = Petición.Cabeceras['sec-websocket-key'].trim();
				WebSocket.Aceptar_Conexión(Llave);
				Regla.Tipo == 'WebSocket'
				? Regla.Opciones.Acción(Petición, WebSocket) : false;
				break;
			};
		}
	}
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param {HTTP.IncomingMessage} SrvPetición La petición que recibió el servidor.
	 * @param {HTTP.ServerResponse} SrvRespuesta La conexión con el cliente.
	 * @returns {void}
	 */
	Peticiones(SrvPetición, SrvRespuesta) {
		let Petición = new Servidor.Petición(SrvPetición);
		let Respuesta = new Servidor.Respuesta(Petición, SrvRespuesta, this.Plantillas);
		Petición.Sesión = new  Servidor.Sesión(Petición, Respuesta);
		_Peticiones.Log(
			'[Petición]:',
			Petición.IP,
			Petición.Método,
			Petición.Url, Petición.Cookies.get('SS_UUID')
		);
		this.Enrutar(Petición, Respuesta);
	};
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param {HTTP.IncomingMessage} SrvPetición La petición que recibió el servidor.
	 * @param {import('stream').Duplex} Socket La respuesta que dará el servidor.
	 * @returns {void}
	 */
	Solicitudes(SrvPetición, Socket) {
		let Petición = new Servidor.Petición(SrvPetición);
		let WebSocket = new Servidor.WebSocket(Socket);
		Petición.Sesión = new  Servidor.Sesión(Petición);
		if (!(Petición.Cookies.has('SS_UUID'))) WebSocket.SS_UUID = Petición.Sesión.SS_UUID;
		_Solicitudes.Log(
			'[WebSocket]:',
			Petición.IP,
			Petición.Método,
			Petición.Url, Petición.Cookies.get('SS_UUID')
		);
		this.EnrutarWebSocket(Petición, WebSocket);
	};
	/**
	 * Carga la llave y certificado SSL y devuelve su contenido en strings
	 * @param {string} RutaCer La ruta de el certificado SSL.
	 * @param {string} RutaKey La ruta de la llave SSL.
	 * @returns {Promise<{cert: (Buffer|string), key: (Buffer|string)}>}
	 */
	static Certificados(RutaCer, RutaKey) {
	  	return new Promise((PrRespuesta, PrError) => {
		  	FS.stat(RutaCer, (Error, Detalles) => {
			  	if (Error) return PrError(Error.message);
			  	if (!(Detalles.isFile())) return PrError('La ruta del Certificado no pertenece a un archivo');
			  	FS.readFile(RutaCer, (Error, Certificado) => {
				  	if (Error) return PrError(Error.message);
				  	FS.stat(RutaKey, (Error, Detalles) => {
					  	if (Error) return PrError(Error.message);
					  	if (!(Detalles.isFile())) return PrError('La ruta de la llave no pertenece a un archivo');
					  	FS.readFile(RutaKey, (Error, Llave) => {
						  	if (Error) return PrError(Error.message);
						  	PrRespuesta({
								cert: Certificado,
								key: Llave
						  	});
					  	});
				  	});
			  	});
		  	});
	  	});
	}
}