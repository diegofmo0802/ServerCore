/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds a simple way to create HTTP/S and WS/S servers.
 * @license Apache-2.0
 */

import HTTP from 'http';
import FS from 'fs';
import HTTPS from 'https';

import Utilities from '../Utilities/Utilities.js';
import _LoggerManager from '../LoggerManager/LoggerManager.js';
import _DebugUI from './DebugUI.js';
import _Config from '../Config.js';
import _Request from "./Request.js";
import _Response from "./Response.js";
import _Session from "./Session.js";
import _Cookie from "./Cookie.js";
import _WebSocket from "./WebSocket/WebSocket.js";
import _Router from "./Router/Router.js";

const $logger = _LoggerManager.getInstance();

export class Server {
	private protocol: Server.Protocol | null;
	private HttpServer: HTTP.Server | null;
	private HttpsServer: HTTP.Server | null;
	public router: Server.Router;
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
		this.router = new Server.Router(this.config);
		this.HttpServer = null;
		this.HttpsServer = null;
		this.protocol = null;
		this.logger = _LoggerManager.getInstance();
		this.router.addFolder('/Saml:Global', Utilities.Path.normalize(`${Utilities.Path.moduleDir}/global`));
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
			if (!this.HttpServer && !this.HttpsServer) throw Error('No server to stop');
			if (this.HttpServer) {
				await this.stopHTTP();
				this.HttpServer = null;
				$logger.info('&C(255,180,220)│   &C3✔ HTTP server stopped');
			}
			if (this.HttpsServer) {
				await this.stopHTTPS();
				this.HttpsServer = null;
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
		http.on('request', this.router.requestManager.bind(this.router));
		http.on('upgrade', this.router.upgradeManager.bind(this.router));
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
		https.on('request', this.router.requestManager.bind(this.router));
		https.on('upgrade', this.router.upgradeManager.bind(this.router));
		return new Promise((resolve) => https.listen(port, host, () => resolve(https)));
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
    export import Router = _Router;
	export import LoggerManager = _LoggerManager;
	export import DebugUI = _DebugUI;
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
}

export default Server;