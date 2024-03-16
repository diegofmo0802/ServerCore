/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene lo necesario para las reglas de enrutamiento de ServerCore.
 * @license Apache-2.0
 */

import Request from './Request.js';
import Response from './Response.js';
import WebSocket from './WebSocket.js';

declare class Rule<T extends keyof Rule.Type> {
    /**El tipo de la regla de enrutamiento */
    public Type: T;
    /**El método que aceptara la regla de enrutamiento */
    public Method: Request.Method;
    /**La UrlRule con la que se creo la regla de enrutamiento */
    public UrlRule: string;
    /**La función de Autenticación */
    public AuthExec: Rule.AuthExec;
    /**La expresión regular de la regla de enrutamiento */
    public Expression: RegExp;
    /**La contenido de ejecución la regla de enrutamiento */
    public Content: Rule.Type[T];
    /**
     * Crea una regla de enrutamiento para ServerCore.
     * @param Type El tipo de regla.
     * @param Method El método de la petición de la regla.
     * @param UrlRule Es la regla que adoptara la clase Rule.
     * @param Content El contenido de ejecución de la regla.
     * @param AuthExec La función de autenticación.
     */
    public constructor(Type: T, Method: Request.Method, UrlRule: string, Content: Rule.Type[T], AuthExec?: Rule.AuthExec);
    /**
     * Ejecuta el contenido de la regla.
     * @param Request El Request que coincidió con la regla.
     * @param Client El cliente que hizo la petición.
     */
    public Exec(Request: Request, Client: Rule.ClientType<T>): void;
    /**
     * Comprueba si una url coincide con esta ruta.
     * @param {Request} Request La petición recibida.
     * @param isWebSocket Define si se revisará un WebSocket.
     */
    public Test(Request: Request, isWebSocket: boolean = true): boolean;
    /**
     * Obtiene los RuleParams de la regla de enrutamiento si esta tiene.
     * @param Path La url a resolver.
     */
    public GetRuleParams(Path: string): { [Name: string]: string };
    /**
     * Extrae la Url parcial usando la expresión de la regla.
     * @param Url La url de donde se extraerá la url parcial.
     */
    public GetRelativeUrl(Url: string): string;
    /**
     * Crea una expresión regular para poder comprobar con ella las rutas.
     * @param UrlRule La UrlRule Con la que se formara la RegExp.
     */
    private GetExpression(UrlRule: string): RegExp;
}

declare namespace Rule {
    type AuthExec = (Request: Request) => boolean;
    type ActionExec = (Request: Request, Response: Response) => void;
    type WebSocketExec = (Request: Request, WebSocket: WebSocket) => void;
    type ClientType<T extends keyof Type> = T extends 'WebSocket' ? WebSocket : Response;
    type Type = {
        File: string,
        Folder: string,
        Action: ActionExec,
        WebSocket: WebSocketExec
    }
}

export default Rule;