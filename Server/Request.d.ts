/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Petición de `Saml/Server-core`.
 */

import HTTP from 'http';
import Sesión from './Session.js';

export namespace Petición {
    type Método = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
    type GET = Map<string, any>;
    type POST = {
        Archivos: Map<string, {
            Archivo: Buffer,
            Nombre: string,
            Peso: number
            Tipo: string
        }>,
        Desconocido?: Buffer | String;
        Errores?: Array<String | Error>
        Formato: (
            'application/json' |
            'application/octet-stream' |
            'application/xml' |
            'application/x-www-form-urlencoded' |
            'multipart/form-data' |
            'text/plain' |
            'Desconocido'
        ),
        Variables: Map<string, any>
    }
}
export class Petición {
	/**Contiene los encabezados de la petición. */
	public Cabeceras: HTTP.IncomingHttpHeaders;
	/**Contiene las cookies de la petición. */
	public Cookies: Map<string, string>;
	/**Contiene los datos POST que se enviaron. */
	public GET: Petición.GET;
	/**Contiene la dirección IP de quien realizo la petición. */
	public IP:string;
	/**Contiene el método de la petición. */
	public Método: Petición.Método;
	/**Contiene los datos POST que se enviaron. */
	public POST: Petición.POST;
	/**Contiene la Sesión del dispositivo donde se realizo la petición.*/
	public Sesión: Sesión;
	/**Contiene la petición que recibió el servidor. */
	private SrvPetición: HTTP.IncomingMessage;
	/**Contiene la url de la petición. */
	public Url: string;
	/**
	 * Crea la forma de petición de `Saml/Servidor`.
	 * @param SrvPetición La petición que recibió el servidor.
	 */
	public constructor(SrvPetición: HTTP.IncomingMessage);
	/**
	 * Convierte una cadena cookie en un objeto js.
	 * @param Cookie El texto de la cabecera `cookie`.
	 */
	private Decodificar_Cookies(Cookie: string): Map<string, string>;
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param SrvPetición La petición que recibió el servidor.
	 */
	private Datos_Post(SrvPetición: HTTP.IncomingMessage): Promise<Petición.POST>;
	/**
	 * Define que método se uso para realizar la petición.
	 * @param Método El método con el que se realizo la petición.
	 */
	private ObtenerMétodo(Método: string): Petición.Método;
	/**
	 * Obtiene los datos enviados por medio de URL QUERY.
	 * @param Url La url recibida de la petición http.
	 */
	private Variables_Get(Url: string): Map<string, string>
}export default Petición;