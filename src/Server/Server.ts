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
import _LoggerManager from '../LoggerManager/LoggerManager.js';
import _Config from '../Config.js';
import _Request from "./Request.js";
import _Response from "./Response.js";
import _Session from "./Session.js";
import _Cookie from "./Cookie.js";
import _WebSocket from "./WebSocket/WebSocket.js";
import _Rule from './Rule.js';

const $logger = _LoggerManager.getInstance();

export class Server {
	private protocol: Server.Protocol | null;
	private HttpServer: HTTP.Server | null;
	private HttpsServer: HTTP.Server | null;
	private rules: Server.Rule[];
	public config: Server.Config;
	public logger: Server.LoggerManager;
	/**
	 * Creates an HTTP/S server.
	 * @param port - The port the server will listen on.
	 * @param host - The host the server will bind to.
	 * @param sslOptions - The SSL configuration.
	 */
	public constructor(options?: Server.Config.options | Server.Config) {
		this.config = options instanceof Server.Config ? options : new Server.Config(options);
		this.rules = [];
		this.HttpServer = null;
		this.HttpsServer = null;
		this.protocol = null;
		this.logger = _LoggerManager.getInstance();
		this.addFolder('/Saml:Global', Utilities.Path.normalize(`${Utilities.Path.moduleDir}/global`));
	}
	/**
	 * Starts the server.
	 */
	public async start(): Promise<void> {
		const { port, host, ssl: sslOptions } = this.config;
		this.protocol = sslOptions ? 'HTTP/S' : 'HTTP';
		$logger.info('&C(255,180,220)╭─────────────────────────────────────────────');
		$logger.info('&C(255,180,220)│ &C1ServerCore by diegofmo0802');
		$logger.info('&C(255,180,220)│ &C1Server starting...');
		$logger.info('&C(255,180,220)├─────────────────────────────────────────────');
		try {
			this.HttpServer = await this.initHTTP(port, host);
			$logger.info(`&C(255,180,220)│ &C3Protocol: &R${this.protocol}`);
			$logger.info(`&C(255,180,220)│ &C3Host: &R${host}`);
			$logger.info(`&C(255,180,220)│ &C3HTTP Port: &R${port}`);
			$logger.info(`&C(255,180,220)│ &C3HTTP URL: &C6http://${host}:${port}`);
			try { if (sslOptions) {
				this.HttpsServer = await this.initHTTPS(host, sslOptions);
				$logger.info(`&C(255,180,220)│ &C3HTTPS Port: &R${sslOptions.port ?? 443}`);
				$logger.info(`&C(255,180,220)│ &C3HTTPS URL: &C6https://${host}:${sslOptions.port ?? 443}`);
			} } catch(error) {
				throw Error('Certificate error ' + (error instanceof Error ? error.message : error), { cause: error });
			}
			$logger.info('&C(255,180,220)╰─────────────────────────────────────────────');
		} catch(error) {
			$logger.error(`&C(255,180,220)│ &C1✖ Error starting server: &R&C6${error instanceof Error ? error.message : error}`);
			$logger.info('&C(255,180,220)╰─────────────────────────────────────────────');
			this.stop();
		}
	}
	/**
	 * Stops the server.
	 */
	public async stop(): Promise<void> {
		try {
			$logger.info('&C(255,180,220)╭─────────────────────────────');
			$logger.info('&C(255,180,220)│ &C1Stopping server...');
			if (this.HttpServer) {
				await this.stopHTTP();
				$logger.info('&C(255,180,220)│   &C3✔ HTTP server stopped');
			}
			if (this.HttpsServer) {
				await this.stopHTTPS();
				$logger.info('&C(255,180,220)│   &C3✔ HTTPS server stopped');
			}
			$logger.info('&C(255,180,220)│ &C2✔ All servers stopped successfully');
			$logger.info('&C(255,180,220)╰─────────────────────────────');
		} catch(error) {
			$logger.error('&C(255,180,220)│ &C1✖ Error stopping server: &R&C6' + (error instanceof Error ? error.message : error));
			
			$logger.info('&C(255,180,220)╰─────────────────────────────');
		}
	}
	/**
	 * Stops the HTTP server.
	 */
	private async stopHTTP(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.HttpServer) this.HttpServer.close((error) => error ? reject(error) : resolve());
			else resolve();
		});
	}
	/**
	 * Stops the HTTPS server.
	 */
	private async stopHTTPS(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.HttpsServer) this.HttpsServer.close((error) => error ? reject(error) : resolve());
			else resolve();
		});
	}
	/**
	 * Restarts the server.
	 */
	public async restart(): Promise<void> {
		await this.stop();
		await this.start();
	}
	/**
	 * Initializes the HTTP server.
	 * @param port - The port the HTTP server will listen on.
	 * @param host - The host the HTTP server will bind to.
	 * @returns A promise that resolves with the created HTTP server.
	 */
	private async initHTTP(port: number, host: string): Promise<HTTP.Server> {
		const http = HTTP.createServer();
		http.on('request', this.requestManager.bind(this));
		http.on('upgrade', this.upgradeManager.bind(this));
		return new Promise((resolve) => http.listen(port, host, () => resolve(http)));
	}
	/**
	 * Initializes the HTTPS server.
	 * @param host - The host the HTTPS server will bind to.
	 * @param sslOptions - The SSL configuration.
	 * @returns A promise that resolves with the created HTTPS server.
	 */
	private async initHTTPS(host: string, sslOptions: Server.SSLOptions): Promise<HTTP.Server> {
		const port = sslOptions.port ?? 443;
		const cert = await Server.loadCertificates(sslOptions.pubKey, sslOptions.privKey);
		const https = HTTPS.createServer(cert);
		https.on('request', this.requestManager.bind(this));
		https.on('upgrade', this.upgradeManager.bind(this));
		return new Promise((resolve) => https.listen(port, host, () => resolve(https)));
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
	public addAction(method: Server.Request.Method, urlRule: string, action: Server.Rule.ActionExec, auth?: Server.Rule.AuthExec): Server {
		this.addRules(new Server.Rule('Action', method, urlRule, action, auth));
		return this;
	}
	/**
	 * Adds a file routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The path to the file to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFile(urlRule: string, source: string, auth?: Server.Rule.AuthExec): Server{
		this.addRules(new Server.Rule('File', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a folder routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The directory path to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFolder(urlRule: string, source: string, auth?: Server.Rule.AuthExec): Server {
		this.addRules(new Server.Rule('Folder', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a WebSocket routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param action - The action to be executed on connection.
	 * @param auth - The optional authorization check function.
	 */
	public addWebSocket(urlRule: string, action: Server.Rule.WebSocketExec, auth?: Server.Rule.AuthExec): Server {
		this.addRules(new Server.Rule('WebSocket', 'ALL', urlRule, action, auth));
		return this;
	}
	/**
	 * Defines default `.HSaml` templates for the server.
	 * @param name - The name of the template.
	 * @param path - The path to the `.HSaml` template file.
	 */
	public setTemplate(name: keyof Server.Config.Templates, path: string): Server {
		this.config.templates[name] = path;
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
				if (rule.testAuth(request)) {
					try { rule.exec(request, response); }
					catch(error) {
						$logger.request.error('&C1Error executing rule:&R&C6', (error instanceof Error ? error.message : error));
						$logger.request.error('&C1Route:', request.method, request.url);
						response.sendError(500, 'Internal Server Error');
					}
				} else response.sendError(403, `You don't have permission to access: ${request.method} -> ${request.url}`);
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
					try { rule.exec(request, webSocket); }
					catch(error) {
						$logger.webSocket.error('&C1Error executing rule:&R&C6', (error instanceof Error ? error.message : error));
						$logger.webSocket.error('&C1Route:', request.method, request.url);
						webSocket.send('HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n');
						webSocket.end();
					}
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
		const request = new Server.Request(HttpRequest);
		const response = new Server.Response(request, HttpResponse, this.config.templates);
		const sessionID = request.cookies.get('Session');
		$logger.request.log(request.ip, request.method, request.url, sessionID);
		this.routeRequest(request, response);
	};
	/**
	 * Will be executed when the server receives an upgrade request.
	 * @param HttpRequest The request received by the server.
	 * @param Socket The socket to respond with (WebSocket upgrade).
	 */
	private upgradeManager(HttpRequest: HTTP.IncomingMessage, Socket: Duplex): void {
		const request = new Server.Request(HttpRequest);
		const webSocket = new Server.WebSocket(Socket);
		const sessionID = request.cookies.get('Session');
		$logger.webSocket.log(request.ip, request.method, request.url, sessionID);
		this.routeWebSocket(request, webSocket);
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
	export import Config = _Config;
    export import Cookie = _Cookie
    export import Request = _Request
    export import Response = _Response
    export import Session = _Session
    export import WebSocket = _WebSocket
    export import Rule = _Rule;
	export import LoggerManager = _LoggerManager;
    export interface Certificates {
        cert: Buffer | string,
        key: Buffer | string
    }
	export type SSLOptions = {
        pubKey: string,
		privKey: string,
		port?: number
    };
    export type Protocol = 'HTTP' | 'HTTPS' | 'HTTP/S';
	export type Rules = Array<Rule>;
}

export default Server;