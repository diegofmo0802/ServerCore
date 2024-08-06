/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Añade la forma de Petición de `Saml/Server-core`.
 * @license Apache-2.0
 */

import URI from 'url';
import HTTP from 'http';
import Cookie from './Cookie.js';
import Session from './Session.js';

export class Request {
	/**Contiene los encabezados de la petición. */
	public headers: Request.Headers;
	/**Contiene las cookies de la petición. */
	public cookies: Cookie;
	/**Contiene los datos POST que se enviaron. */
	public queryParams: Request.GET;
	/**Contiene la dirección IP de quien realizo la petición. */
	public ip?: string | string[];
	/**Contiene el método de la petición. */
	public method: Request.Method;
	/**Contiene los datos POST que se enviaron. */
	public post: Promise<Request.POST>;
	/**Contiene la Sesión del dispositivo donde se realizo la petición.*/
	private session: Session;
	/**Contiene la petición que recibió el servidor. */
	private httpRequest: HTTP.IncomingMessage;
	/**Contiene la url de la petición. */
	public url: string;
	/**@type Los parámetros de la UrlRule */
	public ruleParams: Request.RuleParams = {};
	/**
	 * Crea la forma de petición de `Saml/Servidor`.
	 * @param httpRequest La petición que recibió el servidor.
	 */
	public constructor(httpRequest: HTTP.IncomingMessage) {
        const forwardedIP = httpRequest.headers['x-forwarded-for'];
        const remoteIP = httpRequest.socket.remoteAddress;
        const method = httpRequest.method ?? 'GET';
        const url = httpRequest.url       ?? '/'
		this.httpRequest = httpRequest;
		this.ip = forwardedIP ? forwardedIP : remoteIP ? remoteIP : '0.0.0.0';
		this.method = this.getMethod(method);
		this.url = url.split('?')[0];
		this.url = decodeURI(this.url.endsWith('/') ? this.url : this.url + '/');
        this.headers = httpRequest.headers;
		this.cookies = new Cookie(this.headers.cookie);
		this.session = Session.getInstance(this.cookies);
		this.queryParams = this.getQueryParams(url);
		this.post = this.getPostData(httpRequest);
	}
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param httpRequest La petición que recibió el servidor.
	 */
	private getPostData(httpRequest: HTTP.IncomingMessage): Promise<Request.POST> {
		return new Promise((resolve, reject) => {
			let data = Buffer.from([]);
			const parts: any[] = [];
			httpRequest.on('data', (Part) => {
				if(data.length > 1e+8) {
					httpRequest.destroy();
				}
				parts.push(Part);
			});
			httpRequest.on('end', () => {
				data = Buffer.concat(parts);
				if (this.headers['content-type']) {
					const [format, ...options] = this.headers['content-type'].trim().split(';');
					switch(format.toLowerCase()) {
						case 'text/plain': {
							resolve({
								mimeType: 'text/plain',
								content: data.toString('utf-8'),
								files: null
							});
							break;
						}
						case 'application/json': {
							try {
								resolve({
									mimeType: 'application/json',
									content: JSON.parse(data.toString('utf-8')),
									files: null
								});
							} catch(error) { reject(error); }
							break;
						}
						case 'application/x-www-form-urlencoded': {
							const content: Request.POST.VarList = {};
							const decoded = data.toString('latin1');
							const fragments = decoded.split('&');
							fragments.forEach((pair) => {
							  const [key, value] = pair.split('=');
							  content[decodeURIComponent(key)] = decodeURIComponent(value);
							});
							resolve({
								mimeType: 'application/x-www-form-urlencoded',
								content: content,
								files: null
							});
							break;
						}
						case 'multipart/form-data': {
							const vars: Request.POST.VarList = {};
							const files: Request.POST.FileList = {};
							const separator = '--' + options.join(';').replace(/.*boundary=(.*)/gi, (result, separator) => separator);
							const fragments = data.toString('latin1').trim().split(separator);
							fragments.forEach((fragment) => {
								const info  =
								/Content-Disposition: ?form-data;? ?name="(.*?)?";? ?(?:filename="(.*?)?")?(?:\s*)?(?:Content-Type: ?(.*)?)?([^]*)/i
								.exec(fragment);
								if (info) {
									const [varName, fileName, mimeType, content] = info.splice(1);
									if (fileName) {
										try {
											//let Carpeta = `.Guardado/${this.Sesión.SS_UUID || UUID()}`;
											//let Ruta = `${Carpeta}/${Date.now()}_${UUID()}__${Archivo}`;
											//if (!FS.existsSync('.Guardado_Temp')) FS.mkdirSync('.Guardado_Temp');
											//if (!FS.existsSync(Carpeta)) FS.mkdirSync(Carpeta);
											const data = Buffer.from(content.trim(), 'binary');
											//let Stream = FS.createWriteStream(Ruta);
											//Stream.write(Contenido.trim(), 'binary');
											files[Buffer.from(varName, 'binary').toString()] = {
												content: data,
												name: Buffer.from(fileName, 'binary').toString(),
												//Ruta: Ruta,
												size: data.byteLength,
												mimeType: Buffer.from(mimeType, 'binary').toString()
											};
										} catch(error) {
											console.log('Error', error);
											reject(error);
										}
									} else vars[Buffer.from(varName, 'binary').toString()] = Buffer.from(content, 'binary').toString().trim();
								}
							});
							resolve({
								mimeType: 'multipart/form-data',
								content: vars, files: files
							});
							break;
						}
						default: {
							resolve({
								mimeType: 'Unknown',
								content: data,
								files: null
							});
							break;
						}
					}
				} else {
					resolve({
						mimeType: 'none',
						content: {},
						files: null
					});
				}
			});
			httpRequest.on('error', (error) => {
				console.log(error);
				reject(error);
			});
		});
	}
	/**
	 * Define que método se uso para realizar la petición.
	 * @param method El método con el que se realizo la petición.
	 */
	private getMethod(method: string): Request.Method {
		return method == 'POST'
		? 'POST'
		: method == 'PUT' ? 'PUT'
			: method == 'DELETE' ? 'DELETE'
			: 'GET';
	}
	/**
	 * Obtiene los datos enviados por medio de URL QUERY.
	 * @param Url La url recibida de la petición http.
	 */
	private getQueryParams(Url: string): Map<string, string> {
		let UrlObject = new URI.URL(`http://x.x${Url}`);
		return new Map(UrlObject.searchParams);
	}
}

export namespace Request {
	export namespace POST {
        export interface File {
            content: Buffer;
            name: string;
            size: number;
            mimeType: string;
        }
		export interface FileList {
			[name: string]: File;
		}
		export interface VarList {
			[name: string]: string;
		}
	}
	export interface Headers extends HTTP.IncomingHttpHeaders {
		
	}
    export interface RuleParams {
        [name: string]: string | undefined;
    }
    export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
    export type GET = Map<string, string>;
    export type POST = (
		{ mimeType: 'application/json',                  	 content: any,
														 	 files: null
		} | { mimeType: 'application/x-www-form-urlencoded', content: POST.VarList
														 	 files: null
		} | { mimeType: 'text/plain',                        content: string,
														 	 files: null
		} | { mimeType: 'Unknown',                           content: Buffer,
														 	 files: null
		} | { mimeType: 'none',                           	 content: {},
														 	 files: null
		} | { mimeType: 'multipart/form-data',               content: POST.VarList,
														 	 files: POST.FileList,
		}
	);
}

export default Request;