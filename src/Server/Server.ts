/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds a simple way to create HTTP/S and WS/S servers.
 * @license Apache-2.0
 */

import HTTP from 'http';
import FS from 'fs';
import HTTPS from 'https';
import { Duplex } from 'stream';

import Utilities from '../Utilities/Utilities.js';
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
	private host: string;
	private templates: Server.Templates;
	private protocol: Server.Protocol;
	private HttpPort: number;
	private HttpsPort: number;
	private HttpServer: HTTP.Server;
	private HttpsServer?: HTTP.Server;
	private rules: Rule[];
	/**
	 * Creates an HTTP/S server.
	 * @param port - The port the server will listen on.
	 * @param host - The host the server will bind to.
	 * @param sslOptions - The SSL configuration.
	 */
	public constructor(port?: number, host?: string, sslOptions?: Server.SSLOptions) {
		this.host = host ? host : '0.0.0.0';
		this.templates = {};
		this.HttpPort = port ? port : 80;
		this.HttpsPort = sslOptions && sslOptions.port ? sslOptions.port : 443;
		this.rules = [];
        this.protocol = sslOptions && sslOptions.pubKey && sslOptions.privKey ? 'HTTPS' : 'HTTP';
		this.addFolder('/Saml:Global', `${Utilities.Path.moduleDir}\\global`);
		Debug.log('&B(255,180,220)&C0---------------------------------');
		Debug.log('&B(255,180,220)&C0-  ServerCore by diegofmo0802.  -');
		Debug.log('&B(255,180,220)&C0-        Server started         -');
		Debug.log('&B(255,180,220)&C0---------------------------------');
		let [HttpStarted, HttpsStarted] = [false, false];
		this.HttpServer = HTTP.createServer((Request, Response) => {
			this.requestManager(Request, Response);
		}).on('upgrade', (Request, Socket) => {
			this.upgradeManager(Request, Socket);
		}).listen(this.HttpPort, host, () => {
			this.protocol = this.protocol == 'HTTPS' ? 'HTTP/S' : 'HTTP';
			Debug.log('&B(255,180,220)&C0-&R Host', this.host ? this.host : 'localhost');
			Debug.log('&B(255,180,220)&C0-&R HTTP Port', this.HttpPort);
			if (!(sslOptions && sslOptions.pubKey && sslOptions.privKey) || HttpsStarted)
            Debug.log('&B(255,180,220)&C0---------------------------------');
		});
		if (!sslOptions || !sslOptions.pubKey || !sslOptions.privKey) return;
		Server.loadCertificates(sslOptions.pubKey, sslOptions.privKey).then((Certificates) => {
			this.HttpsServer = HTTPS.createServer(Certificates, (Request, Response) => {
				this.requestManager(Request, Response);
			}).on('upgrade', (Request, Socket) => {
				this.upgradeManager(Request, Socket);
			}).listen(this.HttpsPort, host, () => {
				this.protocol = this.protocol == 'HTTP' ? 'HTTP/S' : 'HTTPS';
				Debug.log('&B(255,180,220)&C0-&R HTTPS Port', this.HttpsPort);
				if (HttpStarted) Debug.log('&B(255,180,220)&C0---------------------------------');
			});
		}).catch((Error) => {
			Debug.log('&C(255,0,0)[Server - Core]: Certificate error: ', Error);
			if (HttpStarted) Debug.log('&B(255,180,220)&C0---------------------------------');
		});
	}
	/**
	 * Adds one or more routing rules to the server.
	 * @param rules - The rule(s) to be added.
	 */
	public addRules(...rules: Server.Rule[]): Server {
		this.rules = this.rules.concat(rules);
		return this;
	}
	/**
	 * Adds an action routing rule.
	 * @param method - The HTTP method to respond to.
	 * @param urlRule - The URL path for the action.
	 * @param action - The action to be executed.
	 * @param auth - The optional authorization check function.
	 */
	public addAction(method: Server.Request.Method, urlRule: string, action: Rule.ActionExec, auth?: Rule.AuthExec): Server {
		this.addRules(new Rule('Action', method, urlRule, action, auth));
		return this;
	}
	/**
	 * Adds a file routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The path to the file to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFile(urlRule: string, source: string, auth?: Rule.AuthExec): Server{
		this.addRules(new Rule('File', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a folder routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The directory path to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFolder(urlRule: string, source: string, auth?: Rule.AuthExec): Server {
		this.addRules(new Rule('Folder', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a WebSocket routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param action - The action to be executed on connection.
	 * @param auth - The optional authorization check function.
	 */
	public addWebSocket(urlRule: string, action: Rule.WebSocketExec, auth?: Rule.AuthExec): Server {
		this.addRules(new Rule('WebSocket', 'ALL', urlRule, action, auth));
		return this;
	}
	/**
	 * Defines default `.HSaml` templates for the server.
	 * @param name - The name of the template.
	 * @param path - The path to the `.HSaml` template file.
	 */
	public setTemplate(name: keyof Server.Templates, path: string): Server {
		this.templates[name] = path;
		return this;
	}
	/**
	 * Routes incoming HTTP requests to be processed.
	 * @param request - The received HTTP request.
	 * @param response - The server response handler.
	 * @throws If no routing rule matches the request.
	 */
	private routeRequest(request: Server.Request, response: Server.Response): void {
		let routed = false;
		for (const rule of this.rules) {
			if (rule.test(request)) {
				if (rule.testAuth(request)) rule.exec(request, response);
				else response.sendError(403, `You don't have permission to access: ${request.method} -> ${request.url}`);
				routed = true;
				break;
			}
		}
		if (!(routed)) response.sendError(400, `No router for: ${request.method} -> ${request.url}`);
	}
	/**
	 * Routes WebSocket connection requests.
	 * @param request - The received HTTP request.
	 * @param webSocket - The WebSocket connection with the client.
	 * @throws If no WebSocket routing rule matches.
	 */
	private routeWebSocket(request: Server.Request, webSocket: Server.WebSocket): void {
		let routed = false;
		for (const rule of this.rules) {
			if (rule.test(request, true)) {			
				if (rule.testAuth(request)) {
					const AcceptKey = (request.headers['sec-websocket-key'] ?? '').trim();
					webSocket.acceptConnection(AcceptKey, request.cookies);
					rule.exec(request, webSocket);
				} else {
					webSocket.send('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
					webSocket.end();
				}
				routed = true;
				break;
			}
		}
		if (!(routed)) webSocket.send(`HTTP/1.1 400 Bad request\r\nNo router for: ${request.method} -> ${request.url}\r\n\r\n`);
	}
	/**
	 * Triggered when the server receives an HTTP request.
	 * @param HttpRequest - The incoming HTTP request.
	 * @param HttpResponse - The server response stream.
	 */
	private requestManager(HttpRequest: HTTP.IncomingMessage, HttpResponse: HTTP.ServerResponse): void {
		const Request = new Server.Request(HttpRequest);
		const Response = new Server.Response(Request, HttpResponse, this.templates);
		const sessionID = Request.cookies.get('Session');
		Debugs.Requests.log( '[Request]:', Request.ip, Request.method, Request.url, sessionID );
		this.routeRequest(Request, Response);
	};
	/**
	 * Will be executed when the server receives an upgrade request.
	 * @param HttpRequest The request received by the server.
	 * @param Socket The socket to respond with (WebSocket upgrade).
	 */
	private upgradeManager(HttpRequest: HTTP.IncomingMessage, Socket: Duplex): void {
		const Request = new Server.Request(HttpRequest);
		const WebSocket = new Server.WebSocket(Socket);
		const sessionID = Request.cookies.get('Session');
		Debugs.UpgradeRequests.log( '[WebSocket]:', Request.ip, Request.method, Request.url, sessionID );
		this.routeWebSocket(Request, WebSocket);
	}
	/**
	 * Loads the SSL key and certificate and returns their content as strings.
	 * @param pathCert Path to the SSL certificate.
	 * @param pathKey Path to the SSL key.
	 * @returns An object containing the certificate and key as Buffers.
	 */
	public static async loadCertificates(pathCert: string, pathKey: string): Promise<Server.Certificates> {
    	pathCert = Utilities.Path.normalize(pathCert);
        pathKey = Utilities.Path.normalize(pathKey);
        const certInfo = await FS.promises.stat(pathCert);
        const keyInfo = await FS.promises.stat(pathKey);
        if (!(certInfo.isFile())) return Promise.reject('The certificate path is not a file');
        if (!(keyInfo.isFile())) return Promise.reject('The key path is not a file');
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
        pubKey: string,
		privKey: string,
		port?: number
    };
    export type Templates = {
        Error?: string,
        Folder?: string
    };
    export type Protocol = 'HTTP' | 'HTTPS' | 'HTTP/S';
	export type Rules = Array<Rule>;
}

export default Server;