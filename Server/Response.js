/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Respuesta a `Saml/Server-core`.
 * @license Apache-2.0
 */

import FS from 'fs';
import PATH from 'path';

import Server from './Server.js';
import Utilities from '../Utilities/Utilities.js';
import Template from '../Template/Template.js';
import { error } from 'console';

class Response {
	/**@type {Server.Request} Contiene la petición que recibió el servidor. */
	Request = null;
	/**@type {Server.Templates} Contiene el listado de plantillas de respuesta del servidor. */
	Templates = null;
	/**@type {import('http').ServerResponse} Contiene la respuesta que dará el servidor. */
	HTTPResponse = null;
	/**
	 * Crea la forma de Respuesta de `Saml/Servidor`.
	 * @param {Server.Request} Request La petición que recibió el servidor.
	 * @param {import('http').ServerResponse} HTTPResponse La respuesta que dará el servidor.
	 * @param {Server.Templates?} Templates El listado de plantillas de respuesta del servidor.
	 */
	constructor(Request, HTTPResponse, Templates = null) {
		this.Request = Request;
		this.Templates = Templates ? Templates : {};
		this.HTTPResponse = HTTPResponse;
		this.HTTPResponse.setHeader('X-Powered-By', 'ServerCore');
		this.HTTPResponse.setHeader('X-Version', '2.0.0');
	}
	/**
	 * Crea encabezados para los tipos de archivo admitidos.
	 * - Se añadirán mas tipos permitidos con el tiempo.
	 * @param {string} Extension La extension de archivo.
	 * @returns {Object}
	 */
	 GenerateHeaders(Extension) {
		Extension = Extension.startsWith('.') ? Extension.slice(1) : Extension;
		let Headers = {};
		let AcceptRanges = false;
		switch(Extension.toUpperCase()) {
			//Formatos de texto
			case 'HTML': Headers['Content-Type'] = 'text/html';        break;
			case 'JS':   Headers['Content-Type'] = 'text/javascript';  break;
			case 'CSS':  Headers['Content-Type'] = 'text/css';         break;
			case 'JSON': Headers['Content-Type'] = 'application/json'; break;
			case 'XML':  Headers['Content-Type'] = 'application/xml';   break;
			case 'TXT':  Headers['Content-Type'] = 'text/plain';       break;
			//Formatos de multimedia
			case 'SVG':  Headers['Content-Type'] = 'image/svg+xml';    AcceptRanges = true; break;
			case 'PNG':  Headers['Content-Type'] = 'image/png';        AcceptRanges = true; break;
			case 'JPG':  Headers['Content-Type'] = 'image/jpeg';       AcceptRanges = true; break;
			case 'JPEG': Headers['Content-Type'] = 'image/jpeg';       AcceptRanges = true; break;
			case 'MP3':  Headers['Content-Type'] = 'audio/mpeg';       AcceptRanges = true; break;
			case 'WAV':  Headers['Content-Type'] = 'audio/x-wav';      AcceptRanges = true; break;
			case 'MP4':  Headers['Content-Type'] = 'video/mp4';        AcceptRanges = true; break;
		}
		if (AcceptRanges) Headers['Accept-Ranges'] = 'bytes';
		return Headers;
	}
	/**
	 * Envía un dato como respuesta.
	 * @param {any} Datum El dato que se enviara.
	 * @param {BufferEncoding?} Encoding La Codificación con la que se enviara la respuesta.
	 * @returns {void}
	 */
	Send(Datum, Encoding = null) {
		Encoding = Encoding ? Encoding : 'utf-8';
		this.HTTPResponse.end(Datum, Encoding);
	}
	/**
	 * Envía un Archivo como respuesta.
	 * @param {string} Path El dato que se enviara.
	 * @returns {void}
	 */
	SendFile(Path) {
		Path = Utilities.Path.Normalize(Path);
		FS.stat(Path, (Error, Details) => {
			if (Error) {
				return Error.code == 'ENOENT'
				? this.SendError(500, '[Fallo En Respuesta] - El archivo no existe.')
				: this.SendError(500, Error.message);
			}
			if (!(Details.isFile())) return this.SendError(500, '[Fallo En Respuesta] - La ruta proporcionada no pertenece a un archivo.');
			if (this.Request.Headers.range) {
				let Information = /bytes=(\d*)?-?(\d*)?/i
				.exec(this.Request.Headers.range);
				if (Information) {
					let [Start, End] = Information.slice(1);
					if (Start) {
						let Temp = null;
						End = End
						? End
						: (Temp = Number(Start) + 1024*1000,
							(Temp >= Details.size
								? Details.size - 1
								: Temp) + '');
						if (Number(Start) <= Details.size && Number(End) <= Details.size) {
							let Size = End ? Number(End) - Number(Start) : Details.size - Number(Start);
							let File = FS.createReadStream(Path, {start: Number(Start), end: Number(End)});
							this.HTTPResponse.setHeader('Content-Length', Size + 1);
							this.HTTPResponse.setHeader('Content-Range', `bytes ${Start}-${End}/${Details.size}`);
							this.SendHeaders(206, this.GenerateHeaders(PATH.extname(Path)));
							File.pipe(this.HTTPResponse);
							//('Inicio:', Inicio, 'Fin:', Final, 'Frag:', Tamaño, 'Tamaño:', Detalles.size)
						} else {
							this.SendError(416, 'El rango solicitado excede el tamaño del archivo');
						}
						//return;
					}
				}
			} else {
				let File = FS.createReadStream(Path);
				this.HTTPResponse.setHeader('Content-Length', Details.size);
				this.SendHeaders(200, this.GenerateHeaders(PATH.extname(Path)));
				File.pipe(this.HTTPResponse);
			}
		});
	}
	/**
	 * Envía el listado de una carpeta como respuesta.
	 * @param {string} BasePath La regla de enrutamiento.
	 * @param {string} RelativePath La petición que recibió el servidor.
	 * @returns {void}
	 */
	SendFolder(BasePath, RelativePath = '') {
		let Path = BasePath;
		Path = Path.endsWith('/') ? Path : Path + '/';
		Path += RelativePath;
		Path = Path.endsWith('/') ? Path.slice(0, -1) : Path;
		//Saml.Debug.Log('[Enrutador - Carpeta]:', Petición.Url, Ruta);
		Path = Utilities.Path.Normalize(Path);
		console.log(Path);
		FS.stat(Path, (Error, Details) => {
			if (Error) {
				return Error.code == 'ENOENT'
				? this.SendError(404, 'El archivo/Directorio no existe.')
				: this.SendError(500, Error.message);
			}
			if (Details.isDirectory()) {
				FS.readdir(Path, (Error, Folder) => {
					if (Error) return this.SendError(500, Error.message);
					if (this.Templates.Folder) {
						this.SendTemplate(this.Templates.Folder, {
							Url: this.Request.Url,
							Carpeta: Folder
						});
					} else {
						this.SendTemplate(`${Utilities.Path.ModuleDir}\\Global\\Template\\Folder.HSaml`, {
							Url: this.Request.Url,
							Carpeta: Folder
						});
						//this.EnviarJSON(Carpeta);
					}
				});
			} else if (Details.isFile()) {
				this.SendFile(Path);
			} else this.SendError(404, 'El archivo/Directorio no existe.');
		});
	}
	/**
	 * Envía los encabezados de la respuesta.
	 * @param {number} Code El código de la respuesta que se dará.
	 * @param {Object} Headers Los encabezados que se enviaran.
	 * @returns {void}
	 */
	SendHeaders(Code, Headers) {
		let CookieSetters = this.Request.Cookies.GetSetters();
		if (CookieSetters.length > 0) Headers['set-cookie'] = CookieSetters;
		this.HTTPResponse.writeHead(Code, Headers);
	}
	/**
	 * Envía una plantilla `.HSaml` como respuesta.
	 * @param {string} Path La ruta de la plantilla.
	 * @param {{}} Data Los datos con los que se compilara la plantilla.
	 * @returns {void}
	 */
	SendTemplate(Path, Data) {
		Path = Utilities.Path.Normalize(Path);
		Template.Load(Path, Data).then((Template) => {
			this.SendHeaders(200, this.GenerateHeaders('html'));
			this.Send(Template, 'utf-8');
		}).catch((Error) => {
			this.SendError(500, Error);
		});
	}
	/**
	 * Envía datos en formato JSON como respuesta.
	 * @param {any} Data El dato que se enviara.
	 * @returns {void}
	 */
	SendJSON(Data) {
		this.SendHeaders(200, this.GenerateHeaders('JSON'));
		this.Send(JSON.stringify(Data), 'utf-8');
	}
	/**
	 * Envía un error como respuesta.
	 * @param {number} Code El código del error que se enviara.
	 * @param {string} Message El mensaje con los detalles del error.
	 * @returns {void}
	 */
	SendError(Code, Message) {
		if (this.Templates.Error) {
			Template.Load(this.Templates.Error, {
				Código: Code, Mensaje: Message
			}).then((Template) => {
				this.SendHeaders(Code, this.GenerateHeaders('html'));
				this.Send(Template);
			}).catch((Error) => {
				this.SendHeaders(Code, this.GenerateHeaders('txt'));
				this.Send(`Error: ${Code} -> ${Message}`);
			});
		} else {
			Template.Load(`${Utilities.Path.ModuleDir}\\Global\\Template\\Error.HSaml`, {
				Código: Code, Mensaje: Message
			}).then((Template) => {
				this.SendHeaders(Code, this.GenerateHeaders('html'));
				this.Send(Template);
			}).catch((Error) => {
				console.log(Error);
				this.SendHeaders(Code, this.GenerateHeaders('txt'));
				this.Send(`Error: ${Code} -> ${Message}`);
			});
			//this.EnviarEncabezados(Código, this.Encabezados('txt'));
			//this.Enviar(`Error: ${Código} -> ${Mensaje}`);
		}
	}
}
export default Response;