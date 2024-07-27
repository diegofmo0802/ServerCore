/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Respuesta a `Saml/Server-core`.
 * @license Apache-2.0
 */

import HTTP from 'http';
import FS from 'fs';
import PATH from 'path';

import Request from './Request.js';
import Server from './Server.js';
import Utilities from '../Utilities.js';
import Template from '../Template.js';

export class Response {
	/**Contiene la petición que recibió el servidor. */
	public request: Request;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private templates: Server.Templates;
	/**Contiene la respuesta que dará el servidor. */
	public httpResponse: HTTP.ServerResponse;
	/**
	 * Crea la forma de Respuesta de `Saml/Servidor`.
	 * @param request La petición que recibió el servidor.
	 * @param httpResponse La respuesta que dará el servidor.
	 * @param templates El listado de plantillas de respuesta del servidor.
	 */
	public constructor(request: Request, httpResponse: HTTP.ServerResponse, templates: Server.Templates = {}) {
        this.request = request;
        this.templates = templates ? templates : {};
        this.httpResponse = httpResponse;
        this.httpResponse.setHeader('X-Powered-By', 'ServerCore');
        this.httpResponse.setHeader('X-Version', '3.7.0-dev.1');
    }
	/**
	 * Crea encabezados para los tipos de archivo admitidos.
	 * - Se añadirán mas tipos permitidos con el tiempo.
	 * @param extension La extension de archivo.
	 */
	public generateHeaders(extension: string): Request.Headers {
		extension = extension.startsWith('.') ? extension.slice(1) : extension;
        extension = extension.toLowerCase();
		const headers: Request.Headers = {};
		const contentTypeMap: Response.contentTypeMap = {
            'html': 'text/html',
            'js': 'text/javascript',
            'css': 'text/css',
            'json': 'application/json',
            'xml': 'application/xml',
            'txt': 'text/plain',
            'svg': 'image/svg+xml',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'mp3': 'audio/mpeg',
            'wav': 'audio/x-wav',
            'mp4': 'video/mp4',
        };
		const acceptRangeFormats = [
			'svg', 'png', 'jpg', 'jpeg', 'mp3', 'wav', 'mp4'
		];
		const type = contentTypeMap[extension]
		if  (type) headers['Content-Type'] = type;
		if (acceptRangeFormats.includes(extension)) {
            headers['Accept-Ranges'] = 'bytes';
        }
		return headers;
	}
	/**
	 * Envía un dato como respuesta.
	 * @param data El dato que se enviara.
	 * @param encode La Codificación con la que se enviara la respuesta.
	 */
	public Send(data: string | Buffer, encode?: BufferEncoding): void  {
		encode = encode ? encode : 'utf-8';
		this.httpResponse.end(data, encode);
	}
	/**
	 * Envía un Archivo como respuesta.
	 * @param path El dato que se enviara.
	 */
	public async sendFile(path: string): Promise<void>  {
		path = Utilities.Path.normalize(path);
        try {
            const details = await FS.promises.stat(path);
            if (!details.isFile()) return this.SendError(500, '[Fallo En Respuesta] - La ruta proporcionada no pertenece a un archivo.');
            if (!this.request.Headers.range) {
                const stream = FS.createReadStream(path);
				this.httpResponse.setHeader('Content-Length', details.size);
				this.SendHeaders(200, this.generateHeaders(PATH.extname(path)));
				stream.pipe(this.httpResponse);
            } else {
                const info = /bytes=(\d*)?-?(\d*)?/i
				.exec(this.request.Headers.range);
                if (!info) return this.SendError(416, 'El rango solicitado excede el tamaño del archivo');
				const [startString, endString] = info.slice(1);
                if (!startString) return this.SendError(416, 'El rango solicitado excede el tamaño del archivo');
                const start = Number(startString);
				const maxSize = start + 1024*1000;
                const end = endString
                ? Number(endString)
                : maxSize >= details.size
                    ? details.size - 1
                    : maxSize;
				if (start > details.size || end > details.size) return this.SendError(416, 'El rango solicitado excede el tamaño del archivo');
				const size = end - start;
				const file = FS.createReadStream(path, { start, end });
				this.httpResponse.setHeader('Content-Length', size + 1);
				this.httpResponse.setHeader('Content-Range', `bytes ${start}-${end}/${details.size}`);
				this.SendHeaders(206, this.generateHeaders(PATH.extname(path)));
				file.pipe(this.httpResponse);
            }
        } catch(error) {
			// console.error(error);
            this.SendError(500, error instanceof Error ? error.message : '[Fallo En Respuesta] - El archivo no existe.');
        }
	}
	/**
	 * Envía el listado de una carpeta como respuesta.
	 * @param basePath La regla de enrutamiento.
	 * @param relativePath La petición que recibió el servidor.
	 */
	public async SendFolder(basePath: string, relativePath: string): Promise<void> {
        basePath = basePath.endsWith('/') ? basePath : basePath + '/';
        relativePath = relativePath.endsWith('/') ? relativePath.slice(0, -1) : relativePath;
		const path = Utilities.Path.normalize(basePath + relativePath);
        try {
            const details = await FS.promises.stat(path);
            if (details.isFile()) return this.sendFile(path);
            else if (details.isDirectory()) {
                const folder = await FS.promises.readdir(path);
                if (this.templates.Folder) {
                    this.SendTemplate(this.templates.Folder, {
                        Url: this.request.Url,
                        Carpeta: folder
                    });
                } else {
                    this.SendTemplate(Utilities.Path.relative('\\Global\\Template\\Folder.HSaml'), {
                        Url: this.request.Url,
                        Carpeta: folder
                    });
                }
            } else this.SendError(404, 'El archivo/Directorio no existe.');
        } catch(error) {
			// console.error(error);
            this.SendError(500, error instanceof Error ? error.message : '[Fallo En Respuesta] - El archivo/Directorio no existe.');
        }
	}
	/**
	 * Envía los encabezados de la respuesta.
	 * @param code El código de la respuesta que se dará.
	 * @param headers Los encabezados que se enviaran.
	 */
	public SendHeaders(code: number, headers: Request.Headers): void {
		const CookieSetters = this.request.Cookies.getSetters();
		if (CookieSetters.length > 0) headers['set-cookie'] = CookieSetters;
		this.httpResponse.writeHead(code, headers);
	}
	/**
	 * Envía una plantilla `.HSaml` como respuesta.
	 * @param path La ruta de la plantilla.
	 * @param Data Los datos con los que se compilara la plantilla.
	 */
	public async SendTemplate(path: string, Data: object): Promise<void> {
		path = Utilities.Path.normalize(path);
        try {
            const template = await Template.load(path, Data);
            this.SendHeaders(200, this.generateHeaders('html'));
			this.Send(template, 'utf-8');
        } catch(error) {
			// console.error(error);
            this.SendError(500, error instanceof Error ? error.message : '[Fallo En Respuesta] - La plantilla no existe.');
        }
	}
	/**
	 * Envía datos en formato JSON como respuesta.
	 * @param data El dato que se enviara.
	 */
	public SendJSON(data: any): void {
        this.SendHeaders(200, this.generateHeaders('JSON'));
		this.Send(JSON.stringify(data), 'utf-8');
    }
	/**
	 * Envía un error como respuesta.
	 * @param code El código del error que se enviara.
	 * @param message El mensaje con los detalles del error.
	 */
	public async SendError(code: number, message: string): Promise<void> {
        try {
            if (this.templates.Error) {
                const template = await Template.load(this.templates.Error, {
                    Código: code, Mensaje: message
                });
                this.SendHeaders(code, this.generateHeaders('html'));
                this.Send(template);
            } else {
                const template = await Template.load(Utilities.Path.relative("\\Global\\Template\\Error.HSaml"), {
                    Código: code, Mensaje: message
                });
                this.SendHeaders(code, this.generateHeaders('html'));
                this.Send(template);
            }
        } catch(error) {
			// console.error(error);
            this.SendHeaders(code, this.generateHeaders('txt'));
            this.Send(`Error: ${code} -> ${message}`);
        }
	}
}

export namespace Response {
	export interface contentTypeMap {
		[key: string]: string | undefined;
	}
    export type Extensions = (
        'HTML' | 'JS' | 'CSS' | 'JSON' | 'XML' | 'TXT' |
        'SVG' | 'PNG' | 'JPG' | 'JPEG' | 'MP3' | 'WAV' | 'MP4'
    );
}

export default Response;