/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Respuesta a `Saml/Server-core`.
 * @license Apache-2.0
 */

import HTTP from 'http';

import Server from './Server.js';
import Request from './Request.js';

export namespace Response {
    type Extensions =
        //Formatos de Texto
        'HTML' | 'JS' | 'CSS' | 'JSON' | 'XML' | 'TXT' |
        //Formatos de multimedia
        'SVG' | 'PNG' | 'JPG' | 'JPEG' | 'MP3' | 'WAV' | 'MP4';
}
export class Response {
	/**Contiene la petición que recibió el servidor. */
	public Request: Request;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private Templates: Server.Plantillas;
	/**Contiene la respuesta que dará el servidor. */
	public HTTPResponse: HTTP.ServerResponse;
	/**
	 * Crea la forma de Respuesta de `Saml/Servidor`.
	 * @param Request La petición que recibió el servidor.
	 * @param HTTPResponse La respuesta que dará el servidor.
	 * @param Templates El listado de plantillas de respuesta del servidor.
	 */
	public constructor(Request: Request, HTTPResponse: HTTP.ServerResponse, Templates: Server.Plantillas);
	/**
	 * Crea encabezados para los tipos de archivo admitidos.
	 * - Se añadirán mas tipos permitidos con el tiempo.
	 * @param Extension La extension de archivo.
	 */
	public GenerateHeaders(Extension: Response.Extensions): object;
	/**
	 * Envía un dato como respuesta.
	 * @param Datum El dato que se enviara.
	 * @param Encoding La Codificación con la que se enviara la respuesta.
	 */
	public Send(Datum: any, Encoding?: BufferEncoding): void;
	/**
	 * Envía un Archivo como respuesta.
	 * @param Path El dato que se enviara.
	 */
	public SendFile(Path: string): void;
	/**
	 * Envía el listado de una carpeta como respuesta.
	 * @param Rule La regla de enrutamiento.
	 * @param Request La petición que recibió el servidor.
	 */
	public EnviarCarpeta(Rule: Server.Regla.Carpeta, Request: Request): void;
	/**
	 * Envía los encabezados de la respuesta.
	 * @param Code El código de la respuesta que se dará.
	 * @param Headers Los encabezados que se enviaran.
	 */
	public SendHeaders(Code: number, Headers: object): void;
	/**
	 * Envía una plantilla `.HSaml` como respuesta.
	 * @param Path La ruta de la plantilla.
	 * @param Data Los datos con los que se compilara la plantilla.
	 */
	public SendTemplate(Path: string, Data: object): void;
	/**
	 * Envía datos en formato JSON como respuesta.
	 * @param Data El dato que se enviara.
	 */
	public SendJSON(Data: any): void;
	/**
	 * Envía un error como respuesta.
	 * @param Code El código del error que se enviara.
	 * @param Message El mensaje con los detalles del error.
	 */
	public SendError(Code: number, Message: string): void;
}
export default Response;