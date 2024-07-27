/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade una forma sencilla de crear servidores HTTP/S y WS/S.
 * @license Apache-2.0
 */

import HTTP from 'http';
import FS from 'fs';
import HTTPS from 'https';
import { Duplex } from 'stream';

import Utilities from '../Utilities.js';
import Debug from '../Debug.js';
import Config from '../Config.js';

const { debugs: Debugs } = Config.getInstance();

import _Request from "./Request.js";
import _Response from "./Response.js";
import _Session from "./Session.js";
import _Cookie from "./Cookie.js";
import _WebSocket from "./WebSocket/WebSocket.js";
import _Rule from './Rule.js';
import Rule from './Rule.js';

export class Server {
	/**Contiene el host donde el servidor recibirá peticiones. */
	private Host: string;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private Templates: Server.Templates;
	/**El protocolo en el que se esta ejecutando el servidor. */
	private Protocol: Server.Protocol;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTP. */
	private HttpPort: number;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTPS. */
	private HttpsPort: number;
	/**Contiene el servidor HTTP/S. */
	private HttpServer: HTTP.Server;
	/**Contiene el servidor HTTP/S. */
	private HttpsServer?: HTTP.Server;
	/**Contiene las reglas de enrutamiento del servidor. */
	private Rules: Rule[];
	/**
	 * Crea un servidor HTTP/S.
	 * @param port El puerto donde el servidor recibirá peticiones.
	 * @param host El host donde el servidor recibirá peticiones.
	 * @param sslOptions La configuración SSL.
	 */
	public constructor(port?: number, host?: string, sslOptions?: Server.SSLOptions) {
		this.Host = host ? host : '0.0.0.0';
		this.Templates = {};
		this.HttpPort = port ? port : 80;
		this.HttpsPort = sslOptions && sslOptions.Port ? sslOptions.Port : 443;
		this.Rules = [];
        this.Protocol = sslOptions && sslOptions.Public && sslOptions.Private ? 'HTTPS' : 'HTTP';
		Debug.log('&B(255,180,220)&C0---------------------------------');
		Debug.log('&B(255,180,220)&C0- Saml/Servidor by diegofmo0802 -');
		Debug.log('&B(255,180,220)&C0-       Servidor Iniciado       -');
		Debug.log('&B(255,180,220)&C0---------------------------------');
		let [HttpStarted, HttpsStarted] = [false, false];
		this.HttpServer = HTTP.createServer((Request, Response) => {
			this.Requests(Request, Response);
		}).on('upgrade', (Request, Socket) => {
			this.UpgradeRequests(Request, Socket);
		}).listen(this.HttpPort, host, () => {
			this.Protocol = this.Protocol == 'HTTPS' ? 'HTTP/S' : 'HTTP';
			Debug.log('&B(255,180,220)&C0-&R Host', this.Host ? this.Host : 'localhost');
			Debug.log('&B(255,180,220)&C0-&R Puerto HTTP', this.HttpPort);
			if (!(sslOptions && sslOptions.Public && sslOptions.Private) || HttpsStarted)
            Debug.log('&B(255,180,220)&C0---------------------------------');
		});
		if (sslOptions && sslOptions.Public && sslOptions.Private) {
			Server.LoadCertificates(sslOptions.Public, sslOptions.Private).then((Certificates) => {
				this.HttpsServer = HTTPS.createServer(Certificates, (Request, Response) => {
					this.Requests(Request, Response);
				}).on('upgrade', (Request, Socket) => {
					this.UpgradeRequests(Request, Socket);
				}).listen(this.HttpsPort, host, () => {
					this.Protocol = this.Protocol == 'HTTP' ? 'HTTP/S' : 'HTTPS';
					Debug.log('&B(255,180,220)&C0-&R Puerto HTTPS', this.HttpsPort);
					if (HttpStarted) Debug.log('&B(255,180,220)&C0---------------------------------');
				});
			}).catch((Error) => {
				Debug.log('&C(255,0,0)[Server - Core]: Error con los certificados: ', Error);
				if (HttpStarted) Debug.log('&B(255,180,220)&C0---------------------------------');
			});
		}
		this.AddFolder('/Saml:Global', `${Utilities.Path.moduleDir}\\Global`);
	}
	/**
	 * Añade una/varias regla/s de enrutamiento para el servidor.
	 * @param rules La regla/s que desea añadir.
	 */
	public AddRules(...rules: Server.Rule[]): Server {
		this.Rules = this.Rules.concat(rules);
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de acción.
	 * @param method El Método HTTP al que deseas que se responda.
	 * @param urlRule La url donde escuchara la acción.
	 * @param action La acción que se ejecutara.
	 * @param auth La función de comprobación de autorización.
	 */
	public AddAction(method: Server.Request.Method, urlRule: string, action: Rule.ActionExec, auth?: Rule.AuthExec): Server {
		this.AddRules(new Rule('Action', method, urlRule, action, auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de archivo.
	 * @param urlRule La url donde escuchara la acción.
	 * @param source La Ruta del archivo que desea enviar.
	 * @param auth La función de comprobación de autorización.
	 */
	public AddFile(urlRule: string, source: string, auth?: Rule.AuthExec): Server{
		this.AddRules(new Rule('File', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de carpeta.
	 * @param urlRule La url donde escuchara la acción.
	 * @param source La Ruta del directorio que desea enviar.
	 * @param auth La función de comprobación de autorización.
	 */
	public AddFolder(urlRule: string, source: string, auth?: Rule.AuthExec): Server {
		this.AddRules(new Rule('Folder', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Añade una regla de enrutamiento de WebSocket.
	 * @param urlRule La url donde escuchara la petición de conexión.
	 * @param action La acción que se ejecutara.
	 * @param auth La función de comprobación de autorización.
	 */
	public AddWebSocket(urlRule: string, action: Rule.WebSocketExec, auth?: Rule.AuthExec): Server {
		this.AddRules(new Rule('WebSocket', 'ALL', urlRule, action, auth));
		return this;
	}
	/**
	 * Define la plantillas `.HSaml` predeterminadas del servidor.
	 * @param Template El nombre de la plantilla.
	 * @param Rule La ruta de la plantilla `.HSaml`.
	 */
	public SetTemplate(name: keyof Server.Templates, path: string): Server {
		this.Templates[name] = path;
		return this;
	}
	/**
	 * Enruta las peticiones hechas al servidor para que sean procesadas.
	 * @param request La petición que recibió el servidor.
	 * @param response La respuesta que dará el servidor.
	 */
	private Route(request: Server.Request, response: Server.Response): void {
		let routed = false;
		for (const Rule of this.Rules) {
			if (Rule.test(request)) {
				if (Rule.testAuth(request)) {
					Rule.exec(request, response);
				} else {
					response.SendError(403, `No tienes permiso para acceder a: ${request.method} -> ${request.url}`);
				}
				routed = true;
				break;
			}
		}
		if (!(routed)) response.SendError(400, `Sin enrutador para: ${request.method} -> ${request.url}`);
	}
	/**
	 * Enruta las peticiones de conexión WebSocket.
	 * @param request La petición que recibió el servidor.
	 * @param webSocket La conexión con el cliente.
	 */
	private RouteWebSocket(request: Server.Request, webSocket: Server.WebSocket): void {
		let Routed = false;
		for (const Rule of this.Rules) {
			if (Rule.test(request, true)) {			
				if (Rule.testAuth(request)) {
					console.log("[WebSocket]: routed");
					const AcceptKey = (request.headers['sec-websocket-key'] ?? '').trim();
					webSocket.AcceptConnection(AcceptKey, request.cookies);
					Rule.exec(request, webSocket);
				} else {
					console.log("[WebSocket]: Forbidden");
					webSocket.Send('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
					webSocket.End();
				}
				Routed = true;
				break;
			}
		}
		if (!(Routed)) console.log("[WebSocket]: no routed");
		if (!(Routed)) webSocket.Send(`HTTP/1.1 400 Bad request\r\nSin enrutador para: ${request.method} -> ${request.url}\r\n\r\n`);
	}
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param HttpRequest La petición que recibió el servidor.
	 * @param HttpResponse La conexión con el cliente.
	 */
	private Requests(HttpRequest: HTTP.IncomingMessage, HttpResponse: HTTP.ServerResponse): void {
		const Request = new Server.Request(HttpRequest);
		const Response = new Server.Response(Request, HttpResponse, this.Templates);
		Debugs.Requests.log(
			'[Petición]:',
			Request.ip,
			Request.method,
			Request.url, Request.cookies.get('Session')
		);
		this.Route(Request, Response);
	};
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param HttpRequest La petición que recibió el servidor.
	 * @param Socket La respuesta que dará el servidor.
	 */
	private UpgradeRequests(HttpRequest: HTTP.IncomingMessage, Socket: Duplex): void {
		let Request = new Server.Request(HttpRequest);
		let WebSocket = new Server.WebSocket(Socket);
		Debugs.UpgradeRequests.log(
			'[WebSocket]:',
			Request.ip,
			Request.method,
			Request.url, Request.cookies.get('Session')
		);
		this.RouteWebSocket(Request, WebSocket);
	}
	/**
	 * Carga la llave y certificado SSL y devuelve su contenido en strings
	 * @param pathCert La ruta de el certificado SSL.
	 * @param pathKey La ruta de la llave SSL.
	 */
	public static async LoadCertificates(pathCert: string, pathKey: string): Promise<Server.Certificates> {
        pathCert = Utilities.Path.normalize(pathCert);
        pathKey = Utilities.Path.normalize(pathKey);
        const certInfo = await FS.promises.stat(pathCert);
        const keyInfo = await FS.promises.stat(pathKey);
        if (!(certInfo.isFile())) return Promise.reject('La ruta del Certificado no pertenece a un archivo');
        if (!(keyInfo.isFile())) return Promise.reject('La ruta de la llave no pertenece a un archivo');
        const cert = await FS.promises.readFile(pathCert);
        const key = await FS.promises.readFile(pathKey);
        return { cert, key };
  }
}

export namespace Server {
    export import Cookie = _Cookie
    export import Request = _Request
    export import Response = _Response
    export import Session = _Session
    export import WebSocket = _WebSocket
    export import Rule = _Rule;
    export interface Certificates {
        cert: Buffer | string,
        key: Buffer | string
    }
	export type SSLOptions = {
        Public: string,
		Private: string,
		Port?: number
    };
    export type Templates = {
        Error?: string,
        Folder?: string
    };
    export type Protocol = 'HTTP' | 'HTTPS' | 'HTTP/S';
	export type Rules = Array<Rule>;
}

export default Server;