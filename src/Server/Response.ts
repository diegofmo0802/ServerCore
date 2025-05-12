/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds the response format to `Saml/Server-core`.
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
	/** Contains the request received by the server. */
	public request: Request;
	/** Contains the list of server response templates. */
	private templates: Server.Templates;
	/** Contains the response to be sent by the server. */
	public httpResponse: HTTP.ServerResponse;
	/**
	 * Creates the `Saml/Server` response format.
	 * @param request - The request received by the server.
	 * @param httpResponse - The response to be sent by the server.
	 * @param templates - The list of server response templates.
	 */
	public constructor(request: Request, httpResponse: HTTP.ServerResponse, templates: Server.Templates = {}) {
        this.request = request;
        this.templates = templates ? templates : {};
        this.httpResponse = httpResponse;
        this.httpResponse.setHeader('X-Powered-By', 'ServerCore');
        this.httpResponse.setHeader('X-Version', '3.7.0-dev.1');
    }
	/**
	 * Generates headers for supported file types.
	 * More types will be supported over time.
	 * @param extension - The file extension.
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
		const type = contentTypeMap[extension];
		if (type) headers['Content-Type'] = type;
		if (acceptRangeFormats.includes(extension)) {
            headers['Accept-Ranges'] = 'bytes';
        }
		return headers;
	}
	/**
	 * Sends data as a response.
	 * @param data - The data to be sent.
	 * @param encode - The encoding used for the response.
	 */
	public send(data: string | Buffer, encode?: BufferEncoding): void  {
		encode = encode ? encode : 'utf-8';
		this.httpResponse.end(data, encode);
	}
	/**
	 * Sends a file as a response.
	 * @param path - The file path to send.
	 * @throws If the file does not exist or is not accessible.
	 */
	public async sendFile(path: string): Promise<void>  {
		path = Utilities.Path.normalize(path);
        try {
            const details = await FS.promises.stat(path);
            if (!details.isFile()) return this.SendError(500, '[Response Error] - Provided path is not a file.');
            if (!this.request.headers.range) {
                const stream = FS.createReadStream(path);
				this.httpResponse.setHeader('Content-Length', details.size);
				this.sendHeaders(200, this.generateHeaders(PATH.extname(path)));
				stream.pipe(this.httpResponse);
            } else {
                const info = /bytes=(\d*)?-?(\d*)?/i.exec(this.request.headers.range);
                if (!info) return this.SendError(416, 'Requested range exceeds file size');
				const [startString, endString] = info.slice(1);
                if (!startString) return this.SendError(416, 'Requested range exceeds file size');
                const start = Number(startString);
				const maxSize = start + 1024 * 1000;
                const end = endString
					? Number(endString)
					: maxSize >= details.size
						? details.size - 1
						: maxSize;
				if (start > details.size || end > details.size) return this.SendError(416, 'Requested range exceeds file size');
				const size = end - start;
				const file = FS.createReadStream(path, { start, end });
				this.httpResponse.setHeader('Content-Length', size + 1);
				this.httpResponse.setHeader('Content-Range', `bytes ${start}-${end}/${details.size}`);
				this.sendHeaders(206, this.generateHeaders(PATH.extname(path)));
				file.pipe(this.httpResponse);
            }
        } catch(error) {
            this.SendError(500, error instanceof Error ? error.message : '[Response Error] - File does not exist.');
        }
	}
	/**
	 * Sends the listing of a folder as a response.
	 * @param basePath - The routing rule base path.
	 * @param relativePath - The relative path received in the request.
	 * @throws If the folder does not exist or is invalid.
	 */
	public async sendFolder(basePath: string, relativePath: string): Promise<void> {
        basePath = basePath.endsWith('/') ? basePath : basePath + '/';
        relativePath = relativePath.endsWith('/') ? relativePath.slice(0, -1) : relativePath;
		const path = Utilities.Path.normalize(basePath + relativePath);
        try {
            const details = await FS.promises.stat(path);
            if (details.isFile()) return this.sendFile(path);
            if (!details.isDirectory()) return this.SendError(404, 'File/Directory does not exist.');
            const folder = await FS.promises.readdir(path);
            if (this.templates.Folder) {
                this.sendTemplate(this.templates.Folder, {
                    Url: this.request.url,
                    Carpeta: folder
                });
            } else {
                this.sendTemplate(Utilities.Path.relative('\\global\\Template\\Folder.HSaml'), {
                    Url: this.request.url,
                    Carpeta: folder
                });
            }
        } catch(error) {
            this.SendError(500, error instanceof Error ? error.message : '[Response Error] - File/Directory does not exist.');
        }
	}
	/**
	 * Sends response headers.
	 * @param code - The HTTP status code.
	 * @param headers - The headers to send.
	 */
	public sendHeaders(code: number, headers: Request.Headers): void {
		const cookieSetters = this.request.cookies.getSetters();
		if (cookieSetters.length > 0) headers['set-cookie'] = cookieSetters;
		this.httpResponse.writeHead(code, headers);
	}
	/**
	 * Sends a `.HSaml` template as a response.
	 * @param path - The template file path.
	 * @param Data - The data to compile the template with.
	 * @throws If the template cannot be loaded.
	 */
	public async sendTemplate(path: string, Data: object): Promise<void> {
		path = Utilities.Path.normalize(path);
        try {
            const template = await Template.load(path, Data);
            this.sendHeaders(200, this.generateHeaders('html'));
			this.send(template, 'utf-8');
        } catch(error) {
            this.SendError(500, error instanceof Error ? error.message : '[Response Error] - Template does not exist.');
        }
	}
	/**
	 * Sends data in JSON format.
	 * @param data - The data to send.
	 */
	public sendJson(data: any): void {
        this.sendHeaders(200, this.generateHeaders('JSON'));
		this.send(JSON.stringify(data), 'utf-8');
    }
	/**
	 * Sends an error as a response.
	 * @param code - The HTTP status code of the error.
	 * @param message - The error message.
	 */
	public async SendError(code: number, message: string): Promise<void> {
        try {
            if (this.templates.Error) {
                const template = await Template.load(this.templates.Error, {
                    Código: code, Mensaje: message
                });
                this.sendHeaders(code, this.generateHeaders('html'));
                this.send(template);
            } else {
                const template = await Template.load(Utilities.Path.relative("\\global\\Template\\Error.HSaml"), {
                    Código: code, Mensaje: message
                });
                this.sendHeaders(code, this.generateHeaders('html'));
                this.send(template);
            }
        } catch(error) {
			console.error(error);
            this.sendHeaders(code, this.generateHeaders('txt'));
            this.send(`Error: ${code} -> ${message}`);
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