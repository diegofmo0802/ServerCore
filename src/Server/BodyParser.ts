/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds the POST parser form of `Saml/Server-core`.
 * @license Apache-2.0
 */

import HTTP from 'http';

export class BodyParser {
    private static FORMDATA_VAR_INFO_REGEX = /Content-Disposition: ?form-data;? ?name="(.*?)?";? ?(?:filename="(.*?)?")?(?:\s*)?(?:Content-Type: ?(.*)?)?([^]*)/i;
    public constructor(
        protected readonly headers: HTTP.IncomingHttpHeaders,
        protected readonly httpRequest: HTTP.IncomingMessage
    ) {}
    /**
	 * Parses the HTTP request body based on its `Content-Type`.
	 * Supports JSON, plain text, URL-encoded forms, and multipart forms.
	 * @returns A structured object containing the parsed content and optional files.
	 */
    public async parse(): Promise<BodyParser.Body> {
        const contentType = this.headers['content-type'] || null;
        if (!contentType) return { mimeType: 'none', content: {}, files: null };
        const body = await this.extractBody();
        const [format, ...options] = contentType.trim().split(';');
        switch(format) {
			case 'text/plain': return this.processText(body);
			case 'application/json': return this.processJson(body);
			case 'application/x-www-form-urlencoded': return this.processUrlEncoded(body);
			case 'multipart/form-data': return this.processFormData(body, options);
			default: return { mimeType: 'unknown', content: body, files: null };
		}
    }
    /**
	 * Extracts the request body as a Buffer.
	 * @throws if the body stream fails.
	 * @returns The full request body as a Buffer.
	 */
    private async extractBody(): Promise<Buffer> {
        const chunks: any[] = [];
        return new Promise((resolve, reject) => {
            this.httpRequest.on('end', () => resolve(Buffer.concat(chunks)));
            this.httpRequest.on('error', (error) => reject(Error('fail parsing request body', { cause: error })));
            this.httpRequest.on('data', (chunk) => {
                if(chunks.length > 1e+8) return void this.httpRequest.destroy();
                chunks.push(chunk);
            });
        });
    }
    /**
	 * Processes a `text/plain` body.
	 * @param body - The raw body buffer.
	 * @returns Object with MIME type, decoded text content, and no files.
	 */
    private processText(body: Buffer): BodyParser.Body.Mimes.Text {
        const text = body.toString('utf-8');
        return {
            mimeType: 'text/plain',
            content: text,
            files: null
        };
    }
    /**
	 * Processes an `application/json` body.
	 * @param body - The raw body buffer.
	 * @returns Object with MIME type, parsed JSON content, and no files.
	 * @throws If the JSON is invalid.
	 */
    private processJson(body: Buffer): BodyParser.Body.Mimes.Json {
        try {
            const text = body.toString('utf-8');
            return {
                mimeType: 'application/json',
                content: JSON.parse(text),
                files: null
            };
        } catch(error) { throw new Error('fail extracting json body', { cause: error }); }
    }
    /**
	 * Processes an `application/x-www-form-urlencoded` body.
	 * @param body - The raw body buffer.
	 * @returns Object with MIME type, key-value content, and no files.
	 */
    private processUrlEncoded(body: Buffer): BodyParser.Body.Mimes.UrlEncoded {
        const content: BodyParser.Body.VarList = {};
        const decoded = body.toString('latin1');
		const fragments = decoded.split('&');
		fragments.forEach((pair) => {
		    const [key, value] = pair.split('=');
		    content[decodeURIComponent(key)] = decodeURIComponent(value);
		});
        return {
            mimeType: 'application/x-www-form-urlencoded',
            content: content,
            files: null
        }
    }
    /**
	 * Processes a `multipart/form-data` body.
	 * Extracts both field values and uploaded files.
	 * @param body - The raw body buffer.
	 * @param options - Header options (usually includes the boundary).
	 * @returns Object with MIME type, form fields, and files.
	 */
    private processFormData(body: Buffer, options: string[] = []): BodyParser.Body.Mimes.FormData {
        const content: BodyParser.Body.VarList = {};
        const files: BodyParser.Body.FileList = {};
		const boundary = options.join(';').replace(/.*boundary=(.*)/gi, (result, boundary: string) => boundary);
		const separator = '--' + (boundary !== '' ? boundary : this.inferBoundary(body) ?? '');
        const decoded = body.toString('latin1').trim();
        const fragments = decoded.split(separator);
        fragments.forEach((fragment) => {
            const info = this.getMultiPartInfo(fragment);
            if (info == null) return;
            if (info.fileName == null) return void (content[info.varName] = info.content.toString());
            files[info.varName] = {
                name: info.fileName,
                size: info.content.length,
                mimeType: info.mimeType || 'unknown',
                content: info.content
            }
        });
        return {
            mimeType: 'multipart/form-data',
            content, files
        };
    }
    /**
	 * Extracts multipart field or file information from a raw string fragment.
	 * @param data - The individual multipart fragment.
	 * @returns Parsed multipart info or `null` if parsing fails.
	 */
    private getMultiPartInfo(data: string): BodyParser.MultiPart.Info | null {
        const info = BodyParser.FORMDATA_VAR_INFO_REGEX.exec(data.trim());
        if (info == null) return null;
        const [ varName = "", fileName = null, mimeType = null, content = "" ] = info.splice(1);
        return {
            varName: Buffer.from(varName.trim(), 'binary').toString(),
            content: Buffer.from(content.trim(), 'binary'),
            fileName: fileName !== null ? Buffer.from(fileName.trim(), 'binary').toString() : null,
            mimeType: mimeType !== null ? Buffer.from(mimeType.trim(), 'binary').toString() : null
        };
    }
	/** 
	 * Tries to infer the boundary from the first line of the request body.
	 * @param body - The request body.
	 */
	private inferBoundary(body: Buffer): string | null {
		const result = body.toString('latin1').match(/^--([^\r\n]+)/);
		if (result == null) return null;
		return result[1];
	}
}
export namespace BodyParser {
	export namespace Body {
        export namespace Mimes {
            export interface Base {
                mimeType: string;
                content: any,
                files: FileList | null
            }
            export interface Json extends Base {
                mimeType: 'application/json';
                content: any;
                files: null;
            }
            export interface Text extends Base {
                mimeType: 'text/plain',
                content: string,
                files: null
            }
            export interface UrlEncoded extends Base{
                mimeType: 'application/x-www-form-urlencoded',
                content: Body.VarList
                files: null
            }
            export interface FormData extends Base {
                mimeType: 'multipart/form-data',
                content: Body.VarList,
                files: Body.FileList,
            }
            export interface None extends Base {
                mimeType: 'none',
                content: VarList,
                files: null
            }
            export interface Unknown extends Base {
                mimeType: 'unknown',
                content: Buffer,
                files: null
            }
        }
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
    export namespace MultiPart {
        export interface Info {
            varName: string;
            fileName: string | null;
            mimeType: string | null;
            content: Buffer;
        }
    }
    export type Body = (
		Body.Mimes.Json |
        Body.Mimes.UrlEncoded |
        Body.Mimes.Text |
        Body.Mimes.Unknown |
        Body.Mimes.None |
        Body.Mimes.FormData
	);
}
export default BodyParser;