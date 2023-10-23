/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade una forma sencilla de crear servidores HTTP/S y WS/S.
 * @license Apache-2.0
 * @module saml.server_core
 */

import HTTP from 'http';
import {Duplex} from 'stream';

import __Petición from "./Request.js";
import __Respuesta from "./Response.js";
import __Sesión from "./Session.js";
import __WebSocket from "./WebSocket.js";

export namespace Servidor {
	export import Petición = __Petición
	export import Respuesta = __Respuesta
    namespace Regla {
        type Base = {
            Método: Petición.Método,
            Url: string
        };
        type Acción = Base & {
            Tipo: 'Acción',
            Opciones: {
                Cobertura: ('Parcial'|'Completa'),
                Acción: (Petición: Petición, Respuesta: Respuesta) => void
            }
        };
        type Archivo = Base & {
            Tipo: 'Archivo',
            Opciones: {
                Cobertura: ('Parcial'|'Completa'),
                Recurso: string,
            }
        };
        type Carpeta = Base & {
            Tipo: 'Carpeta',
            Opciones: {
                Recurso: string,
            }
        };
        type WebSocket = Base & {
            Tipo: 'WebSocket',
            Opciones: {
                Cobertura: ('Parcial' | 'Completa'),
                Acción: (Petición: Petición, WebSocket: M_WebSocket) => void
            }
        };
    }
    type Plantillas = {
        Error?: string,
        Carpeta?: string
    };
    type Protocolo = 'HTTP' | 'HTTPS' | 'HTTP/S';
    type Regla = Regla.Acción | Regla.Archivo | Regla.Carpeta | Regla.WebSocket;
	type Reglas = Array<Regla>;
}
export class Servidor {
	public static Petición: __Petición;
	public static Respuesta: __Respuesta;
	public static Sesión: __Sesión;
	public static WebSocket: __WebSocket;
	/**Contiene el host donde el servidor recibirá peticiones. */
	private Host: string;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private Plantillas: Servidor.Plantillas;
	/**El protocolo en el que se esta ejecutando el servidor. */
	private Protocolo: Servidor.Protocolo;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTP. */
	private PuertoHTTP: number;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTPS. */
	private PuertoHTTPS: number;
	/**Contiene el servidor HTTP/S. */
	private ServidorHTTP: HTTP.Server;
	/**Contiene el servidor HTTP/S. */
	private ServidorHTTPS: HTTP.Server;
	/**Contiene las reglas de enrutamiento del servidor. */
	private Reglas: Array<Servidor.Regla>;
	/**
	 * Crea un servidor HTTP/S.
	 * @param Puerto El puerto donde el servidor recibirá peticiones.
	 * @param Host El host donde el servidor recibirá peticiones.
	 * @param SSL La configuración SSL.
	 */
	public constructor(Puerto?: number, Host?: string, SSL?: {
        Publico: string, Llave: string, Puerto?: number
    });
	/**
	 * Añade una/varias regla/s de enrutamiento para el servidor.
	 * @param Reglas La regla/s que desea añadir.
	 */
	public Añadir_Reglas(...Reglas: Array<Servidor.Regla>): Servidor;
	/**
	 * Define la plantillas `.HSaml` predeterminadas del servidor.
	 * @param Nombre El nombre de la plantilla.
	 * @param Ruta La ruta de la plantilla `.HSaml`.
	 */
	public Definir_Plantillas(Nombre: keyof Servidor.Plantillas, Ruta: string): Servidor;
	/**
	 * Enruta las peticiones hechas al servidor para que sean procesadas.
	 * @param Petición La petición que recibió el servidor.
	 * @param Respuesta La respuesta que dará el servidor.
	 */
	private Enrutar(Petición: Petición, Respuesta: Respuesta): void;
	/**
	 * Enruta las peticiones de conexión WebSocket.
	 * @param Petición La petición que recibió el servidor.
	 * @param WebSocket La conexión con el cliente.
	 */
	private EnrutarWebSocket(Petición: Petición, WebSocket: WebSocket): void;
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param SrvPetición La petición que recibió el servidor.
	 * @param SrvRespuesta La conexión con el cliente.
	 */
	private Peticiones(SrvPetición: HTTP.IncomingMessage, SrvRespuesta: HTTP.ServerResponse): void;
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param SrvPetición La petición que recibió el servidor.
	 * @param Socket La respuesta que dará el servidor.
	 */
	private Solicitudes(SrvPetición: HTTP.IncomingMessage, Socket: Duplex): void
	/**
	 * Carga la llave y certificado SSL y devuelve su contenido en strings
	 * @param RutaCer La ruta de el certificado SSL.
	 * @param RutaKey La ruta de la llave SSL.
	 */
	public static Certificados(RutaCer: string, RutaKey: string): Promise<{
        cert: Buffer | string, key: Buffer | string
    }>
}
export default Servidor;