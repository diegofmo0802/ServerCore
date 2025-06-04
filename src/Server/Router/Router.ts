import HTTP from 'http';
import { Duplex } from 'stream';

import _Rule from './Rule.js';
import Request from '../Request.js';
import Response from '../Response.js';
import WebSocket from '../WebSocket/WebSocket.js';
import LoggerManager from '../../LoggerManager/LoggerManager.js';
import Config from '../../Config';

const $logger = LoggerManager.getInstance();

export class Router {
    public rules: Router.Rule[];
    public config: Config;
    constructor(config: Config, rules?: Router.Rule[]) {
        this.config = config;
        this.rules = rules ?? [];
    }
	/**
	 * Triggered when the server receives an HTTP request.
	 * @param HttpRequest - The incoming HTTP request.
	 * @param HttpResponse - The server response stream.
	 */
	public requestManager(HttpRequest: HTTP.IncomingMessage, HttpResponse: HTTP.ServerResponse): void {
		const request = new Request(HttpRequest);
		const response = new Response(request, HttpResponse, this.config.templates);
		const sessionID = request.cookies.get('Session');
		$logger.request.log(request.ip, request.method, request.url, sessionID);
		this.routeRequest(request, response);
	};
	/**
	 * Will be executed when the server receives an upgrade request.
	 * @param HttpRequest The request received by the server.
	 * @param Socket The socket to respond with (WebSocket upgrade).
	 */
	public upgradeManager(HttpRequest: HTTP.IncomingMessage, Socket: Duplex): void {
		const request = new Request(HttpRequest);
		const webSocket = new WebSocket(Socket);
		const sessionID = request.cookies.get('Session');
		$logger.webSocket.log(request.ip, request.method, request.url, sessionID);
		this.routeWebSocket(request, webSocket);
	}
    
	/**
	 * Routes incoming HTTP requests to be processed.
	 * @param request - The received HTTP request.
	 * @param response - The server response handler.
	 * @throws If no routing rule matches the request.
	 */
	private routeRequest(request: Request, response: Response): void {
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
	private routeWebSocket(request: Request, webSocket: WebSocket): void {
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
	 * Adds one or more routing rules to the server.
	 * @param rules - The rule(s) to be added.
	 */
	public addRules(...rules: Router.Rule[]): this {
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
	public addAction(method: Request.Method, urlRule: string, action: Router.Rule.ActionExec, auth?: Router.Rule.AuthExec): this {
		this.addRules(new Router.Rule('Action', method, urlRule, action, auth));
		return this;
	}
	/**
	 * Adds a file routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The path to the file to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFile(urlRule: string, source: string, auth?: Router.Rule.AuthExec): this {
		this.addRules(new Router.Rule('File', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a folder routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param source - The directory path to be served.
	 * @param auth - The optional authorization check function.
	 */
	public addFolder(urlRule: string, source: string, auth?: Router.Rule.AuthExec): this {
		this.addRules(new Router.Rule('Folder', 'GET', urlRule, source, auth));
		return this;
	}
	/**
	 * Adds a WebSocket routing rule.
	 * @param urlRule - The URL path to listen on.
	 * @param action - The action to be executed on connection.
	 * @param auth - The optional authorization check function.
	 */
	public addWebSocket(urlRule: string, action: Router.Rule.WebSocketExec, auth?: Router.Rule.AuthExec): this {
		this.addRules(new Router.Rule('WebSocket', 'ALL', urlRule, action, auth));
		return this;
	}
}
export namespace Router {
    export import Rule = _Rule;
}
export default Router;