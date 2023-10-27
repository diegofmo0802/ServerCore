/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Respuesta a `Saml/Server-core`.
 */

import FS from 'fs';
import PATH from 'path';
import URL from 'url';

import Plantilla from '../Template/Template.js';
import Servidor from './Server.js';

class Respuesta {
	/**@type {Servidor.Petición} Contiene la petición que recibió el servidor. */
	Petición = null;
	/**@type {Servidor.Plantillas} Contiene el listado de plantillas de respuesta del servidor. */
	Plantillas = null;
	/**@type {import('http').ServerResponse} Contiene la respuesta que dará el servidor. */
	SrvRespuesta = null;
	/**
	 * Crea la forma de Respuesta de `Saml/Servidor`.
	 * @param {typeof Servidor.Petición} Petición La petición que recibió el servidor.
	 * @param {import('http').ServerResponse} SrvRespuesta La respuesta que dará el servidor.
	 * @param {Servidor.Plantillas?} Plantillas El listado de plantillas de respuesta del servidor.
	 */
	constructor(Petición, SrvRespuesta, Plantillas = null) {
		this.Petición = Petición;
		this.Plantillas = Plantillas ? Plantillas : {};
		this.SrvRespuesta = SrvRespuesta;
		this.SrvRespuesta.setHeader('X-Powered-By', 'Saml/Servidor');
		this.SrvRespuesta.setHeader('X-Version', '1.0');
	}
	/**
	 * Crea encabezados para los tipos de archivo admitidos.
	 * - Se añadirán mas tipos permitidos con el tiempo.
	 * @param {string} Extension La extension de archivo.
	 * @returns {Object}
	 */
	 Encabezados(Extension) {
		Extension = Extension.startsWith('.') ? Extension.slice(1) : Extension;
		let Encabezados = {};
		let Rangos = false;
		switch(Extension.toUpperCase()) {
			//Formatos de texto
			case 'HTML': Encabezados['Content-Type'] = 'text/html';        break;
			case 'JS':   Encabezados['Content-Type'] = 'text/javascript';  break;
			case 'CSS':  Encabezados['Content-Type'] = 'text/css';         break;
			case 'JSON': Encabezados['Content-Type'] = 'application/json'; break;
			case 'XML':  Encabezados['Content-Type'] = 'application/xml';   break;
			case 'TXT':  Encabezados['Content-Type'] = 'text/plain';       break;
			//Formatos de multimedia
			case 'SVG':  Encabezados['Content-Type'] = 'image/svg+xml';    Rangos = true; break;
			case 'PNG':  Encabezados['Content-Type'] = 'image/png';        Rangos = true; break;
			case 'JPG':  Encabezados['Content-Type'] = 'image/jpeg';       Rangos = true; break;
			case 'JPEG': Encabezados['Content-Type'] = 'image/jpeg';       Rangos = true; break;
			case 'MP3':  Encabezados['Content-Type'] = 'audio/mpeg';       Rangos = true; break;
			case 'WAV':  Encabezados['Content-Type'] = 'audio/x-wav';      Rangos = true; break;
			case 'MP4':  Encabezados['Content-Type'] = 'video/mp4';        Rangos = true; break;
		}
		if (Rangos) Encabezados['Accept-Ranges'] = 'bytes';
		return Encabezados;
	}
	/**
	 * Envía un dato como respuesta.
	 * @param {any} Dato El dato que se enviara.
	 * @param {BufferEncoding?} Codificación La Codificación con la que se enviara la respuesta.
	 * @returns {void}
	 */
	Enviar(Dato, Codificación = null) {
		Codificación = Codificación ? Codificación : 'utf-8';
		this.SrvRespuesta.end(Dato, Codificación);
	}
	/**
	 * Envía un Archivo como respuesta.
	 * @param {string} Ruta El dato que se enviara.
	 * @returns {void}
	 */
	EnviarArchivo(Ruta) {
		FS.stat(Ruta, (Error, Detalles) => {
			if (Error) {
				return Error.code == 'ENOENT'
				? this.Error(500, '[Fallo En Respuesta] - El archivo no existe.')
				: this.Error(500, Error.message);
			}
			if (!(Detalles.isFile())) return this.Error(500, '[Fallo En Respuesta] - La ruta proporcionada no pertenece a un archivo.');
			if (this.Petición.Cabeceras.range) {
				let Información = /bytes=(\d*)?-?(\d*)?/i
				.exec(this.Petición.Cabeceras.range);
				if (Información) {
					let [Inicio, Final] = Información.slice(1);
					if (Inicio) {
						let Temp = null;
						Final = Final
						? Final
						: (Temp = Number(Inicio) + 1024*1000,
							(Temp >= Detalles.size
								? Detalles.size - 1
								: Temp) + '');
						if (Number(Inicio) <= Detalles.size && Number(Final) <= Detalles.size) {
							let Tamaño = Final ? Number(Final) - Number(Inicio) : Detalles.size - Number(Inicio);
							let Archivo = FS.createReadStream(Ruta, {start: Number(Inicio), end: Number(Final)});
							this.SrvRespuesta.setHeader('Content-Length', Tamaño + 1);
							this.SrvRespuesta.setHeader('Content-Range', `bytes ${Inicio}-${Final}/${Detalles.size}`);
							this.EnviarEncabezados(206, this.Encabezados(PATH.extname(Ruta)));
							Archivo.pipe(this.SrvRespuesta);
							//('Inicio:', Inicio, 'Fin:', Final, 'Frag:', Tamaño, 'Tamaño:', Detalles.size)
						} else {
							this.Error(416, 'El rango solicitado excede el tamaño del archivo');
						}
						return;
					}
				}
			}
			let Archivo = FS.createReadStream(Ruta);
			this.SrvRespuesta.setHeader('Content-Length', Detalles.size);
			this.EnviarEncabezados(200, this.Encabezados(PATH.extname(Ruta)));
			Archivo.pipe(this.SrvRespuesta);
		});
	}
	/**
	 * Envía el listado de una carpeta como respuesta.
	 * @param {import('./Server.js').Servidor.Regla.Carpeta} Regla La regla de enrutamiento.
	 * @param {import('./Request.js').default} Petición La petición que recibió el servidor.
	 * @returns {void}
	 */
	EnviarCarpeta(Regla, Petición) {
		let Ruta = Regla.Opciones.Recurso;
		Ruta = Ruta.endsWith('/') ? Ruta : Ruta + '/';
		Ruta += Petición.Url.slice(Regla.Url.length);
		Ruta = Ruta.endsWith('/') ? Ruta.slice(0, -1) : Ruta;
		//Saml.Debug.Log('[Enrutador - Carpeta]:', Petición.Url, Ruta);
		FS.stat(Ruta, (Error, Detalles) => {
			if (Error) {
				return Error.code == 'ENOENT'
				? this.Error(404, 'El archivo/Directorio no existe.')
				: this.Error(500, Error.message);
			}
			if (Detalles.isDirectory()) {
				FS.readdir(Ruta, (Error, Carpeta) => {
					if (Error) return this.Error(500, Error.message);
					if (this.Plantillas.Carpeta) {
						this.EnviarHSaml(this.Plantillas.Carpeta, {
							Url: Petición.Url,
							Carpeta: Carpeta
						});
					} else {
						// @ts-ignore
						let Directorio = PATH.dirname(URL.fileURLToPath(import.meta.url));
						this.EnviarHSaml(`${Directorio}/../Global/Template/Folder.HSaml`, {
							Url: Petición.Url,
							Carpeta: Carpeta
						});
						//this.EnviarJSON(Carpeta);
					}
				});
			} else if (Detalles.isFile()) {
				this.EnviarArchivo(Ruta);
			} else this.Error(404, 'El archivo/Directorio no existe.');
		});
	}
	/**
	 * Envía los encabezados de la respuesta.
	 * @param {number} Código El código de la respuesta que se dará.
	 * @param {{}} Encabezados Los encabezados que se enviaran.
	 * @returns {void}
	 */
	EnviarEncabezados(Código, Encabezados) {
		this.SrvRespuesta.writeHead(Código, Encabezados);
	}
	/**
	 * Envía una plantilla `.HSaml` como respuesta.
	 * @param {string} Ruta La ruta de la plantilla.
	 * @param {{}} Datos Los datos con los que se compilara la plantilla.
	 * @returns {void}
	 */
	EnviarHSaml(Ruta, Datos) {
		Plantilla.Load(Ruta, Datos).then((Plantilla) => {
			this.EnviarEncabezados(200, this.Encabezados('html'));
			this.Enviar(Plantilla, 'utf-8');
		}).catch((Error) => {
			this.Error(500, Error);
		});
	}
	/**
	 * Envía datos en formato JSON como respuesta.
	 * @param {any} Datos El dato que se enviara.
	 * @returns {void}
	 */
	EnviarJSON(Datos) {
		this.EnviarEncabezados(200, this.Encabezados('JSON'));
		this.Enviar(JSON.stringify(Datos), 'utf-8');
	}
	/**
	 * Envía un error como respuesta.
	 * @param {number} Código El código del error que se enviara.
	 * @param {string} Mensaje El mensaje con los detalles del error.
	 * @returns {void}
	 */
	Error(Código, Mensaje) {
		if (this.Plantillas.Error) {
			Plantilla.Load(this.Plantillas.Error, {
				Código: Código, Mensaje: Mensaje
			}).then((Plantilla) => {
				this.EnviarEncabezados(Código, this.Encabezados('html'));
				this.Enviar(Plantilla);
			}).catch((Error) => {
				this.EnviarEncabezados(Código, this.Encabezados('txt'));
				this.Enviar(`Error: ${Código} -> ${Mensaje}`);
			});
		} else {
			// @ts-ignore
			let Directorio = PATH.dirname(URL.fileURLToPath(import.meta.url));
			Plantilla.Load(`${Directorio}/../Global/Template/Error.HSaml`, {
				Código: Código, Mensaje: Mensaje
			}).then((Plantilla) => {
				this.EnviarEncabezados(Código, this.Encabezados('html'));
				this.Enviar(Plantilla);
			}).catch((Error) => {
				this.EnviarEncabezados(Código, this.Encabezados('txt'));
				this.Enviar(`Error: ${Código} -> ${Mensaje}`);
			});
			//this.EnviarEncabezados(Código, this.Encabezados('txt'));
			//this.Enviar(`Error: ${Código} -> ${Mensaje}`);
		}
	}
}
export default Respuesta;