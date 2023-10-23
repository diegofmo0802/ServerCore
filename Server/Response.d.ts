/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Respuesta a `Saml/Server-core`.
 */

import HTTP from 'http';

import Servidor from './Server.js';
import Petición from './Request.js';
export namespace Respuesta {
    type Extension =
        //Formatos de Texto
        'HTML' | 'JS' | 'CSS' | 'JSON' | 'XML' | 'TXT' |
        //Formatos de multimedia
        'SVG' | 'PNG' | 'JPG' | 'JPEG' | 'MP3' | 'WAV' | 'MP4';
}
export class Respuesta {
	/**Contiene la petición que recibió el servidor. */
	public Petición: Petición;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private Plantillas: Servidor.Plantillas;
	/**Contiene la respuesta que dará el servidor. */
	public SrvRespuesta: HTTP.ServerResponse;
	/**
	 * Crea la forma de Respuesta de `Saml/Servidor`.
	 * @param Petición La petición que recibió el servidor.
	 * @param SrvRespuesta La respuesta que dará el servidor.
	 * @param Plantillas El listado de plantillas de respuesta del servidor.
	 */
	public constructor(Petición: Petición, SrvRespuesta: HTTP.ServerResponse, Plantillas: Servidor.Plantillas);
	/**
	 * Crea encabezados para los tipos de archivo admitidos.
	 * - Se añadirán mas tipos permitidos con el tiempo.
	 * @param Extension La extension de archivo.
	 */
	public Encabezados(Extension: Respuesta.Extension): object;
	/**
	 * Envía un dato como respuesta.
	 * @param Dato El dato que se enviara.
	 * @param Codificación La Codificación con la que se enviara la respuesta.
	 */
	public Enviar(Dato: any, Codificación?: BufferEncoding): void;
	/**
	 * Envía un Archivo como respuesta.
	 * @param Ruta El dato que se enviara.
	 */
	public EnviarArchivo(Ruta: string): void;
	/**
	 * Envía el listado de una carpeta como respuesta.
	 * @param Regla La regla de enrutamiento.
	 * @param Petición La petición que recibió el servidor.
	 */
	public EnviarCarpeta(Regla: Servidor.Regla.Carpeta, Petición: Petición): void;
	/**
	 * Envía los encabezados de la respuesta.
	 * @param Código El código de la respuesta que se dará.
	 * @param Encabezados Los encabezados que se enviaran.
	 */
	public EnviarEncabezados(Código: number, Encabezados: object): void;
	/**
	 * Envía una plantilla `.HSaml` como respuesta.
	 * @param Ruta La ruta de la plantilla.
	 * @param Datos Los datos con los que se compilara la plantilla.
	 */
	public EnviarHSaml(Ruta: string, Datos: object): void;
	/**
	 * Envía datos en formato JSON como respuesta.
	 * @param Datos El dato que se enviara.
	 */
	public EnviarJSON(Datos: any): void;
	/**
	 * Envía un error como respuesta.
	 * @param Código El código del error que se enviara.
	 * @param Mensaje El mensaje con los detalles del error.
	 */
	public Error(Código: number, Mensaje: string): void;
}
export default Respuesta;