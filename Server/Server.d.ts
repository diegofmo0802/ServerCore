/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade una forma sencilla de crear servidores HTTP/S y WS/S.
 * @license Apache-2.0
 * @module Saml.ServerCore
 */

import HTTP from 'http';
import { Duplex } from 'stream';

import __Request from "./Request.js";
import __Response from "./Response.js";
import __Session from "./Session.js";
import __WebSocket from "./WebSocket.js";

export namespace Server {
	export import Request = __Request
	export import Response = __Response
	export import WebSocket = __WebSocket
    namespace Rule {
        type Base = {
            Method: Request.Method,
            Url: string
        };
        type Action = Base & {
            Type: 'Action',
            Options: {
                Coverage: ('Partial' | 'Complete'),
                Action: (Request: Request, Response: Response) => void
            }
        };
        type File = Base & {
            Type: 'File',
            Options: {
                Coverage: ('Partial' | 'Complete'),
                Source: string,
            }
        };
        type Folder = Base & {
            Type: 'Folder',
            Options: {
                Source: string,
            }
        };
        type WebSocket = Base & {
            Type: 'WebSocket',
            Options: {
                Coverage: ('Partial' | 'Complete'),
                Action: (Request: Request, WebSocket: Server.WebSocket) => void
            }
        };
    }
    type Templates = {
        Error?: string,
        Folder?: string
    };
    type Protocol = 'HTTP' | 'HTTPS' | 'HTTP/S';
    type Rule = Rule.Action | Rule.File | Rule.Folder | Rule.WebSocket;
	type Rules = Array<Rule>;
}
export class Server {
	public static Request: __Request;
	public static Response: __Response;
	public static Session: __Session;
	public static WebSocket: __WebSocket;
	/**Contiene el host donde el servidor recibirá peticiones. */
	private Host: string;
	/**Contiene el listado de plantillas de respuesta del servidor. */
	private Templates: Server.Templates;
	/**El protocolo en el que se esta ejecutando el servidor. */
	private Protocol: Server.Protocol;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTP. */
	private HttpPort: number;
	/**Contiene el puerto donde el servidor recibirá peticiones HTTPS. */
	private HttpsPort: number;
	/**Contiene el servidor HTTP/S. */
	private HttpServer: HTTP.Server;
	/**Contiene el servidor HTTP/S. */
	private HttpsServer: HTTP.Server;
	/**Contiene las reglas de enrutamiento del servidor. */
	private Rules: Array<Server.Rule>;
	/**
	 * Crea un servidor HTTP/S.
	 * @param Port El puerto donde el servidor recibirá peticiones.
	 * @param Host El host donde el servidor recibirá peticiones.
	 * @param SSL La configuración SSL.
	 */
	public constructor(Port?: number, Host?: string, SSL?: {
        Public: string, Private: string, Port?: number
    });
	/**
	 * Añade una/varias regla/s de enrutamiento para el servidor.
	 * @param Rules La regla/s que desea añadir.
	 */
	public AddRules(...Rules: Array<Server.Rule>): Server;
	/**
	 * Define la plantillas `.HSaml` predeterminadas del servidor.
	 * @param Template El nombre de la plantilla.
	 * @param Rule La ruta de la plantilla `.HSaml`.
	 */
	public SetTemplate(Template: keyof Server.Templates, Rule: string): Server;
	/**
	 * Enruta las peticiones hechas al servidor para que sean procesadas.
	 * @param Request La petición que recibió el servidor.
	 * @param Response La respuesta que dará el servidor.
	 */
	private Route(Request: Server.Request, Response: Server.Response): void;
	/**
	 * Enruta las peticiones de conexión WebSocket.
	 * @param Request La petición que recibió el servidor.
	 * @param WebSocket La conexión con el cliente.
	 */
	private RouteWebSocket(Request: Server.Request, WebSocket: Server.WebSocket): void;
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param HttpRequest La petición que recibió el servidor.
	 * @param HttpResponse La conexión con el cliente.
	 */
	private Requests(HttpRequest: HTTP.IncomingMessage, HttpResponse: HTTP.ServerResponse): void;
	/**
	 * Se ejecutara cuando el servidor reciba una petición.
	 * @param HttpRequest La petición que recibió el servidor.
	 * @param Socket La respuesta que dará el servidor.
	 */
	private UpgradeRequests(HttpRequest: HTTP.IncomingMessage, Socket: Duplex): void
	/**
	 * Carga la llave y certificado SSL y devuelve su contenido en strings
	 * @param PathCert La ruta de el certificado SSL.
	 * @param PathKey La ruta de la llave SSL.
	 */
	public static LoadCertificates(PathCert: string, PathKey: string): Promise<{
        cert: Buffer | string, key: Buffer | string
    }>
}
export default Server;