/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Petición de `Saml/Server-core`.
 * @license Apache-2.0
 */

import HTTP from 'http';
import Cookie from './Cookie.js';
import Session from './Session.js';

export namespace Request {
	namespace POST {
		type File = Map<string, {
            File: Buffer,
            Name: string,
            Size: number
            Type: string
        }>;
	}
    type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
    type GET = Map<string, any>;
    type POST = (
		{ MimeType: 'application/json',                  Content: any } |
        { MimeType: 'application/x-www-form-urlencoded', Content: Map<string, string> } |
		{ MimeType: 'text/plain',                        Content: string } |
		{ MimeType: 'Unknown',                           Content: Buffer } |
        { MimeType: 'multipart/form-data',               Content: {
			Files: Map<string, POST.File>,
			Vars: Map<string, string>
		} }
	);
}
export class Request {
	/**Contiene los encabezados de la petición. */
	public Headers: HTTP.IncomingHttpHeaders;
	/**Contiene las cookies de la petición. */
	public Cookies: Cookie;
	/**Contiene los datos POST que se enviaron. */
	public GET: Request.GET;
	/**Contiene la dirección IP de quien realizo la petición. */
	public IP:string;
	/**Contiene el método de la petición. */
	public Method: Request.Method;
	/**Contiene los datos POST que se enviaron. */
	public POST: Promise<Request.POST>;
	/**Contiene la Sesión del dispositivo donde se realizo la petición.*/
	public Session: Session;
	/**Contiene la petición que recibió el servidor. */
	private HTTPRequest: HTTP.IncomingMessage;
	/**Contiene la url de la petición. */
	public Url: string;
	/**@type {} Los parámetros de la UrlRule */
	public RuleParams: { [Name: string]: string };
	/**
	 * Crea la forma de petición de `Saml/Servidor`.
	 * @param HTTPRequest La petición que recibió el servidor.
	 */
	public constructor(HTTPRequest: HTTP.IncomingMessage);
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param HTTPRequest La petición que recibió el servidor.
	 */
	private GetPostData(HTTPRequest: HTTP.IncomingMessage): Promise<Request.POST>;
	/**
	 * Define que método se uso para realizar la petición.
	 * @param Method El método con el que se realizo la petición.
	 */
	private GetMethod(Method: string): Request.Method;
	/**
	 * Obtiene los datos enviados por medio de URL QUERY.
	 * @param Url La url recibida de la petición http.
	 */
	private GetData(Url: string): Map<string, string>
}export default Request;