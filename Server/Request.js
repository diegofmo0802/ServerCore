/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Petición de `Saml/Server-core`.
 * @license Apache-2.0
 */

import URI from 'url';
import Cookie from './Cookie.js';

class Request {
	/**@type {import('http').IncomingHttpHeaders} Contiene los encabezados de la petición. */
	Headers = null;
	/**@type {Cookie} Contiene las cookies de la petición. */
	Cookies = null;
	/**@type {import('./Request').Request.GET} Contiene los datos POST que se enviaron. */
	GET = null;
	/**@type {string} Contiene la dirección IP de quien realizo la petición. */
	IP = null;
	/**@type {import('./Request').Request.Method} Contiene el método de la petición. */
	Method = null;
	/**@type {Promise<import('./Request').Request.POST>} Contiene los datos POST que se enviaron. */
	POST = null;
	/**@type {import('./Session').Session} */
	Session = null;
	/**@type {import('http').IncomingMessage} Contiene la petición que recibió el servidor. */
	HTTPRequest = null;
	/**@type {string} Contiene la url de la petición. */
	Url = null;
	/**
	 * Crea la forma de petición de `Saml/Servidor`.
	 * @param {import('http').IncomingMessage} HTTPRequest La petición que recibió el servidor.
	 */
	constructor(HTTPRequest) {
		this.Headers = HTTPRequest.headers;
		this.Cookies = new Cookie(this.Headers.cookie);
		this.GET = this.GetData(HTTPRequest.url);
		this.IP = this.Headers['x-forwarded-for']
		? HTTPRequest.headers['x-forwarded-for'].toString()
		: HTTPRequest.socket.remoteAddress;
		this.Method = this.GetMethod(HTTPRequest.method);
		this.POST = this.GetPostData(HTTPRequest);
		this.HTTPRequest = HTTPRequest;
		this.Url = HTTPRequest.url.split('?')[0];
		this.Url = decodeURI(this.Url.endsWith('/') ? this.Url : this.Url + '/');
	}
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param {import('http').IncomingMessage} HTTPRequest La petición que recibió el servidor.
	 * @returns {Promise<import('./Request').Request.POST>}
	 */
	GetPostData(HTTPRequest) {
		return new Promise((PrResponse, PrError) => {
			let Data = Buffer.from([]);
			let Parts = [];
			HTTPRequest.on('data', (Part) => {
				if(Data.length > 1e+8) {
					Data = null;
					HTTPRequest.destroy();
				}
				Parts.push(Part);
			});
			HTTPRequest.on('end', () => {
				Data = Buffer.concat(Parts);
				if (this.Headers['content-type']) {
					let [Format, ...Options] = this.Headers['content-type'].trim().split(';');
					switch(Format.toLowerCase()) {
						case 'text/plain': {
							PrResponse({
								MimeType: 'text/plain',
								Content: Data.toString('utf-8')
							});
							break;
						}
						case 'application/json': {
							try {
								PrResponse({
									MimeType: 'application/json',
									Content: JSON.parse(Data.toString('utf-8'))
								});
							} catch(Error) {
								PrError(Error);
							}
							break;
						}
						case 'application/x-www-form-urlencoded': {
							let Content = new Map;
							const DecodedData = Data.toString('latin1');
							const KeyValue = DecodedData.split('&');
							KeyValue.forEach((pair) => {
							  const [Key, Value] = pair.split('=');
							  Content.set(decodeURIComponent(Key), decodeURIComponent(Value));
							});
							PrResponse({
								MimeType: 'application/x-www-form-urlencoded',
								Content
							});
							break;
						}
						case 'multipart/form-data': {
							let Vars = new Map;
							let Files = new Map;
							let Separator = '--' + Options.join(';').replace(/.*boundary=(.*)/gi, (Result, Separator) => Separator);
							let Variables = Data.toString('latin1').trim().split(Separator);
							Variables.forEach((Variable) => {
								let Information  =
								/Content-Disposition: ?form-data;? ?name="(.*?)?";? ?(?:filename="(.*?)?")?(?:\s*)?(?:Content-Type: ?(.*)?)?([^]*)/i
								.exec(Variable);
								if (Information) {
									let [Name, File, Type, Content] = Information.splice(1);
									if (File) {
										try {
											//let Carpeta = `.Guardado/${this.Sesión.SS_UUID || UUID()}`;
											//let Ruta = `${Carpeta}/${Date.now()}_${UUID()}__${Archivo}`;
											//if (!FS.existsSync('.Guardado_Temp')) FS.mkdirSync('.Guardado_Temp');
											//if (!FS.existsSync(Carpeta)) FS.mkdirSync(Carpeta);
											let Data = Buffer.from(Content.trim(), 'binary');
											//let Stream = FS.createWriteStream(Ruta);
											//Stream.write(Contenido.trim(), 'binary');
											Files.set(Buffer.from(Name, 'binary').toString(), {
												File: Data,
												Name: Buffer.from(File, 'binary').toString(),
												//Ruta: Ruta,
												Size: Data.byteLength,
												Type: Buffer.from(Type, 'binary').toString()
											});
										} catch(Error) {
											console.log('Error', Error);
											PrError(Error);
										}
									} else Vars.set(Buffer.from(Name, 'binary').toString(), Content ? Buffer.from(Content, 'binary').toString().trim() : null);
								}
							});
							PrResponse({
								MimeType: 'multipart/form-data',
								Content: { Files, Vars }
							});
							break;
						}
						default: {
							PrResponse({
								MimeType: 'Unknown',
								Content: Data
							});
							break;
						}
					}
				}
			});
			HTTPRequest.on('error', (Error) => {
				console.log(Error);
				PrError(Error);
			});
		});
	}
	/**
	 * Obtiene los datos enviados por medio de URL QUERY.
	 * @param {string} Url La url recibida de la petición http.
	 * @returns {Map<string,string>}
	 */
	GetData(Url) {
		let UrlObject = new URI.URL(`http://x.x${Url}`);
		return new Map(UrlObject.searchParams);
	}
	/**
	 * Define que método se uso para realizar la petición.
	 * @param {string} Method El método con el que se realizo la petición.
	 * @returns {import('./Request').Request.Method}
	 */
	GetMethod(Method) {
		return Method == 'POST'
		? 'POST'
		: Method == 'PUT' ? 'PUT'
			: Method == 'DELETE' ? 'DELETE'
			: 'GET';
	}
}
export default Request;