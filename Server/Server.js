/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade una forma sencilla de crear servidores HTTP/S y WS/S.
 * @license Apache-2.0
 * @module Saml.ServerCore
 */

import FS from 'fs';
import HTTP from 'http';
import HTTPS from 'https';

import Utilities from '../Utilities/Utilities.js';
import Debug from '../Debug/Debug.js';
import Config from '../Config/Config.js';

import Rule from './Rule.js';
import Request from "./Request.js";
import Response from "./Response.js";
import Session from "./Session.js";
import WebSocket from "./WebSocket.js";

const Debugs = {
	Requests: Config.Debugs.Requests,
	Upgrades: Config.Debugs.UpgradeRequests
};

class Server {
	/**@type {typeof Rule} */
	static Rule = Rule;
	/**@type {typeof Request} */
	static Request = Request;
	/**@type {typeof Response} */
	static Response = Response;
	/**@type {typeof Session} */
	static Session = Session;
	/**@type {typeof WebSocket} */
	static WebSocket = WebSocket;
	/**@type {string} Contiene el host donde el servidor recibirá peticiones. */
	Host = null;
	/**@type {{}} Contiene el listado de plantillas de respuesta del servidor. */
	Templates = null;
	/**@type {('HTTP'|'HTTPS'|'HTTP/S')} El protocolo en el que se esta ejecutando el servidor. */
	Protocol = null;
	/**@type {number} Contiene el puerto donde el servidor recibirá peticiones HTTP. */
	HttpPort = null;
	/**@type {number} Contiene el puerto donde el servidor recibirá peticiones HTTPS. */
	HttpsPort = null;
	/**@type {HTTP.Server} Contiene el servidor HTTP/S. */
	HttpServer = null;
	/**@type {HTTPS.Server} Contiene el servidor HTTP/S. */
	HttpsServer = null;
	/**@type {Array<Rule>} Contiene las reglas de enrutamiento del servidor. */
	Rules = null;
	/**
	 * Crea un servidor HTTP/S.
	 * @param {number?} Port El puerto donde el servidor recibirá peticiones.
	 * @param {string?} Host El host donde el servidor recibirá peticiones.
	 * @param {{Public: string, Private: string, Port?: number}} SSL La configuración SSL.
	 */
	constructor(Port = null, Host = null, SSL = null) {
		let UseHttps = SSL && SSL.Public && SSL.Private ? true : false;
		this.Host = Host ? Host : null;
		this.Templates = {};
		this.HttpPort = Port ? Port : 80;
		this.HttpsPort = SSL && SSL.Port ? SSL.Port : 443;
		this.Rules = [];
		Debug.Log('&B(255,180,220)&C0---------------------------------');
		Debug.Log('&B(255,180,220)&C0- Saml/Servidor by diegofmo0802 -');
		Debug.Log('&B(255,180,220)&C0-       Servidor Iniciado       -');
		Debug.Log('&B(255,180,220)&C0---------------------------------');
		let [HttpStarted, HttpsStarted] = [false, false];
		this.HttpServer = HTTP.createServer((Request, Response) => {
			this.Requests(Request, Response);
		}).on('upgrade', (Request, Socket) => {
			this.UpgradeRequests(Request, Socket);
		}).listen(this.HttpPort, Host, () => {
			this.Protocol = this.Protocol == 'HTTPS' ? 'HTTP/S' : 'HTTP';
			Debug.Log('&B(255,180,220)&C0-&R Host', this.Host ? this.Host : 'localhost');
			Debug.Log('&B(255,180,220)&C0-&R Puerto HTTP', this.HttpPort);
			if ((! UseHttps) || HttpsStarted) Debug.Log('&B(255,180,220)&C0---------------------------------');
		});
		if (UseHttps) {
			Server.LoadCertificates(SSL.Public, SSL.Private).then((Certificates) => {
				this.HttpsServer = HTTPS.createServer(Certificates, (Request, Response) => {
					this.Requests(Request, Response);
				}).on('upgrade', (Request, Socket) => {
					this.UpgradeRequests(Request, Socket);
				}).listen(this.HttpsPort, Host, () => {
					this.Protocol = this.Protocol == 'HTTP' ? 'HTTP/S' : 'HTTPS';
					Debug.Log('&B(255,180,220)&C0-&R Puerto HTTPS', this.HttpsPort);
					if (HttpStarted) Debug.Log('&B(255,180,220)&C0---------------------------------');
				});
			}).catch((Error) => {
				Debug.Log('&C(255,0,0)[Server - Core]: Error con los certificados: ', Error);
				if (HttpStarted) Debug.Log('&B(255,180,220)&C0---------------------------------');
			});
		}
		this.AddFolder('/Saml:Global', `${Utilities.Path.ModuleDir}\\Global`);
	}
	/**
	 * Añade una/varias regla/s de enrutamiento para el servidor.
	 * @param {Array<Rule>} Rules La regla/s que desea añadir.
	 * @returns {Server}
	 */
	AddRules(...Rules) {
		this.Rules = this.Rules.concat(Rules);
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de acción.
	 * @param {Request.Method} Method El Método HTTP al que deseas que se responda.
	 * @param {string} UrlRule La url donde escuchara la acción.
	 * @param {Rule.ActionExec} Action La acción que se ejecutara.
	 * @param {Rule.AuthExec} Auth La función de comprobación de autorización.
	 * @returns {Server}
	 */
	AddAction(Method, UrlRule, Action, Auth = null) {
		this.AddRules(new Rule('Action', Method, UrlRule, Action, Auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de archivo.
	 * @param {string} UrlRule La url donde escuchara la acción.
	 * @param {string} Source La Ruta del archivo que desea enviar.
	 * @param {Rule.AuthExec} Auth La función de comprobación de autorización.
	 */
	AddFile(UrlRule, Source, Auth = null) {
		this.AddRules(new Rule('File', 'GET', UrlRule, Source, Auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de carpeta.
	 * @param {string} UrlRule La url donde escuchara la acción.
	 * @param {string} Source La Ruta del directorio que desea enviar.
	 * @param {Rule.AuthExec} Auth La función de comprobación de autorización.
	 */
	AddFolder(UrlRule, Source, Auth = null) {
		this.AddRules(new Rule('Folder', 'GET', UrlRule, Source, Auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de WebSocket.
	 * @param {string} UrlRule La url donde escuchara la petición de conexión.
	 * @param {Rule.WebSocketExec} Action La acción que se ejecutara.
	 * @param {Rule.AuthExec} Auth La función de comprobación de autorización.
	 */
	AddWebSocket(UrlRule, Action, Auth = null) {
		this.AddRules(new Rule('WebSocket', 'ALL', UrlRule, Action, Auth));
		return this;
	}
	/**
	 * Define la plantillas `.HSaml` predeterminadas del servidor.
	 * @param {keyof import('./Server.js').Server.Templates} Name El nombre de la plantilla.
	 * @param {string} Path La ruta de la plantilla `.HSaml`.
	 * @returns {Server}
	 */
	SetTemplate(Name, Path) {
		this.Templates[Name] = Path;
		return this;
	}
	/**
	 * Enruta las peticiones hechas al servidor para que sean procesadas.
	 * @param {Request} Request La petición que recibió el servidor.
	 * @param {Response} Response La respuesta que dará el servidor.
	 * @returns {void}
	 */
	Route(Request, Response) {
		let Routed = false;
		for (const Rule of this.Rules) {
			if (Rule.Test(Request)) {
				if (Rule.TestAuth(Request)) {
					Rule.Exec(Request, Response);
				} else {
					Response.SendError(403, `No tienes permiso para acceder a: ${Request.Method} -> ${Request.Url}`);
				}
				Routed = true;
				break;
			}
		}
		if (!(Routed)) Response.SendError(400, `Sin enrutador para: ${Request.Method} -> ${Request.Url}`);
	}
	/**
	 * Enruta las peticiones de conexión WebSocket.
	 * @param {Request} Request La petición que recibió el servidor.
	 * @param {WebSocket} WebSocket La conexión con el cliente.
	 * @returns {void}
	 */
	RouteWebSocket(Request, WebSocket) {
		let Routed = false;
		for (const Rule of this.Rules) {
			if (Rule.Test(Request, true)) {			
				if (Rule.TestAuth(Request)) {
					let AcceptKey = Request.Headers['sec-websocket-key'].trim();
					WebSocket.AcceptConnection(AcceptKey);
					Rule.Exec(Request, WebSocket);
				} else {
					WebSocket.Send('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
					WebSocket.End();
				}
				Routed = true;
				break;
			}
		}
		if (!(Routed)) WebSocket.Send(`HTTP/1.1 400 Bad request\r\nSin enrutador para: ${Request.Method} -> ${Request.Url}\r\n\r\n`);
	}
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param {HTTP.IncomingMessage} HttpRequest La petición que recibió el servidor.
	 * @param {HTTP.ServerResponse} HttpResponse La conexión con el cliente.
	 * @returns {void}
	 */
	Requests(HttpRequest, HttpResponse) {
		let Request = new Server.Request(HttpRequest);
		let Response = new Server.Response(Request, HttpResponse, this.Templates);
		Request.Session = new  Server.Session(Request, Response);
		Debugs.Requests.Log(
			'[Petición]:',
			Request.IP,
			Request.Method,
			Request.Url, Request.Cookies.Get('Session')
		);
		this.Route(Request, Response);
	};
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param {HTTP.IncomingMessage} HttpRequest La petición que recibió el servidor.
	 * @param {import('stream').Duplex} Socket La respuesta que dará el servidor.
	 * @returns {void}
	 */
	UpgradeRequests(HttpRequest, Socket) {
		let Request = new Server.Request(HttpRequest);
		let WebSocket = new Server.WebSocket(Socket);
		Request.Session = new  Server.Session(Request);
		if (!(Request.Cookies.Has('Session'))) WebSocket.SessionID = Request.Session.GetID();
		Debugs.Upgrades.Log(
			'[WebSocket]:',
			Request.IP,
			Request.Method,
			Request.Url, Request.Cookies.Get('Session')
		);
		this.RouteWebSocket(Request, WebSocket);
	};
	/**
	 * Carga la llave y certificado SSL y devuelve su contenido en strings
	 * @param {string} PathCert La ruta de el certificado SSL.
	 * @param {string} PathKey La ruta de la llave SSL.
	 * @returns {Promise<{cert: (Buffer|string), key: (Buffer|string)}>}
	 */
	static LoadCertificates(PathCert, PathKey) {
	  	return new Promise((PrResponse, PrError) => {
		  	FS.stat(PathCert, (Error, Details) => {
			  	if (Error) return PrError(Error.message);
			  	if (!(Details.isFile())) return PrError('La ruta del Certificado no pertenece a un archivo');
			  	FS.readFile(PathCert, (Error, Certificate) => {
				  	if (Error) return PrError(Error.message);
				  	FS.stat(PathKey, (Error, Details) => {
					  	if (Error) return PrError(Error.message);
					  	if (!(Details.isFile())) return PrError('La ruta de la llave no pertenece a un archivo');
					  	FS.readFile(PathKey, (Error, Key) => {
						  	if (Error) return PrError(Error.message);
						  	PrResponse({
								cert: Certificate,
								key: Key
						  	});
					  	});
				  	});
			  	});
		  	});
	  	});
	}
}
export default Server;