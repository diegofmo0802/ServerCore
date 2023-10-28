/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Petición de `Saml/Server-core`.
 * @license Apache-2.0
 */

import URI from 'url';

class Request {
	/**@type {import('http').IncomingHttpHeaders} Contiene los encabezados de la petición. */
	Headers = null;
	/**@type {Map<string, string>} Contiene las cookies de la petición. */
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
		this.Cookies = this.GetCookies(this.Headers.cookie);
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
	 * Convierte una cadena cookie en un objeto js.
	 * @param {string} Cookie El texto de la cabecera `cookie`.
	 * @returns {Map<string,string>}
	 */
	GetCookies(Cookie) {
		if (!(Cookie)) return new Map();
		let Division = Cookie.split(';');
		let Cookies = new Map();
		for (let Part of Division) {
			let [Name, ...Value] = Part.split('=');
			Cookies.set(Name, Value.join('='));
		}
		return Cookies;
	};
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param {import('http').IncomingMessage} HTTPRequest La petición que recibió el servidor.
	 * @returns {Promise<import('./Request').Request.POST>}
	 */
	GetPostData(HTTPRequest) {
		return new Promise((PrResponse, PrError) => {
			let Data = Buffer.from([]);
			let Parts = [];
			/**@type {import('./Request').Request.POST} */
			let POST = {
				Files: new Map,
				MimeType: 'Unknown',
				Variables: new Map
			};
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
						case 'multipart/form-data': {
							POST.MimeType = 'multipart/form-data';
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
											POST.Files.set(Buffer.from(Name, 'binary').toString(), {
												File: Data,
												Name: Buffer.from(File, 'binary').toString(),
												//Ruta: Ruta,
												Size: Data.byteLength,
												Type: Buffer.from(Type, 'binary').toString()
											});
										} catch(Error) {
											console.log('Error');
											PrError(Error);
										}
									} else POST.Variables.set(Buffer.from(Name, 'binary').toString(), Content ? Buffer.from(Content, 'binary').toString().trim() : null);
								}
							});
							break;
						}
						default: {
							POST.MimeType = 'Unknown';
							POST.Unknown = Data;
						}
					}
				}
				PrResponse(POST);
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