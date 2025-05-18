/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds the Request form of `Saml/Server-core`.
 * @license Apache-2.0
 */

import URI from 'url';
import HTTP from 'http';
import Cookie from './Cookie.js';
import Session from './Session.js';
import _BodyParser, { BodyParser } from './BodyParser.js';

export class Request {
	/** Contains the request headers. */
	public headers: Request.Headers;
	/** Contains the request cookies. */
	public cookies: Cookie;
	/** Contains the POST data sent. */
	public searchParams: Request.SearchParams;
	/** Contains the IP address of the requester. */
	public ip?: string | string[];
	/** Contains the request method. */
	public method: Request.Method;
	/** Contains the POSTParser. */
	public session: Session;
	/** Contains the session of the device that made the request. */
	private body: Request.BodyParser;
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
		this.searchParams = this.getSearchParams(url);
		this.body = new Request.BodyParser(this.headers, this.httpRequest);
	}
	public get post(): Promise<BodyParser.Body> { return this.body.parse(); }
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
	private getSearchParams(Url: string): Request.SearchParams {
		let UrlObject = new URI.URL(`http://x.x${Url}`);
		const searchParams: Request.SearchParams = {};
		UrlObject.searchParams.forEach((value, name) => searchParams[name] = value);
		return searchParams;
	}
}

export namespace Request {
	export import BodyParser = _BodyParser;
    export interface Document {
        [name: string]: string | undefined;
    }
    export interface RuleParams extends Document {}
	export interface Headers extends HTTP.IncomingHttpHeaders {}
    export interface SearchParams extends Document {};
    export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
}

export default Request;