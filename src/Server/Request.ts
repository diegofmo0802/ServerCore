/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds the Request form of `Saml/Server-core`.
 * @license Apache-2.0
 */

import URI from 'url';
import HTTP from 'http';
import Cookie from './Cookie.js';
import Session from './Session.js';

export class Request {
	/** Contains the request headers. */
	public headers: Request.Headers;
	/** Contains the request cookies. */
	public cookies: Cookie;
	/** Contains the POST data sent. */
	public queryParams: Request.GET;
	/** Contains the IP address of the requester. */
	public ip?: string | string[];
	/** Contains the request method. */
	public method: Request.Method;
	/** Contains the POST data sent. */
	public post: Promise<Request.POST>;
	/** Contains the session of the device that made the request. */
	public session: Session;
	/** Contains the HTTP request received by the server. */
	private httpRequest: HTTP.IncomingMessage;
	/** Contains the request URL. */
	public url: string;
	/** The UrlRule parameters */
	public ruleParams: Request.RuleParams = {};
	/**
	 * Creates the request form for `Saml/Server`.
	 * @param httpRequest - The HTTP request received by the server.
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
	 * Tries to infer the boundary from the first line of the request body.
	 * @param data - The request content.
	 */
	private inferBoundary(data: Buffer): string | null {
		const result = data.toString('latin1').match(/^--([^\r\n]+)/);
		if (result == null) return null;
		return result[1];
	}
	/**
	 * Retrieves the data and files sent via POST.
	 * @param httpRequest - The HTTP request received by the server.
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
							const boundary = options.join(';').replace(/.*boundary=(.*)/gi, (result, boundary: string) => boundary);
							const separator = '--' + (boundary !== '' ? boundary : this.inferBoundary(data) ?? '');
							const fragments = data.toString('latin1').trim().split(separator);
							fragments.forEach((fragment) => {
								const info  =
								/Content-Disposition: ?form-data;? ?name="(.*?)?";? ?(?:filename="(.*?)?")?(?:\s*)?(?:Content-Type: ?(.*)?)?([^]*)/i
								.exec(fragment);
								if (info) {
									const [varName, fileName, mimeType, content] = info.splice(1);
									if (fileName) {
										try {
											const data = Buffer.from(content.trim(), 'binary');
											files[Buffer.from(varName, 'binary').toString()] = {
												content: data,
												name: Buffer.from(fileName, 'binary').toString(),
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
	 * Defines which method was used to make the request.
	 * @param method - The method used for the request.
	 */
	private getMethod(method: string): Request.Method {
		return method == 'POST'
		? 'POST'
		: method == 'PUT' ? 'PUT'
			: method == 'DELETE' ? 'DELETE'
			: 'GET';
	}
	/**
	 * Retrieves the data sent via URL QUERY.
	 * @param Url - The URL received from the HTTP request.
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
			[name: string]: File | undefined;
		}
		export interface VarList {
			[name: string]: string | undefined;
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
		} | { mimeType: 'none',                           	 content: POST.VarList,
														 	 files: null
		} | { mimeType: 'multipart/form-data',               content: POST.VarList,
														 	 files: POST.FileList,
		}
	);
}

export default Request;