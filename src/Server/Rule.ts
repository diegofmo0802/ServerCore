/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene lo necesario para las reglas de enrutamiento de ServerCore.
 * @license Apache-2.0
 */

import Request from './Request.js';
import Response from './Response.js';
import WebSocket from './WebSocket/WebSocket.js';

export class Rule<T extends keyof Rule.Type = keyof Rule.Type> {
    /**El tipo de la regla de enrutamiento */
    public type: T;
    /**El método que aceptara la regla de enrutamiento */
    public method: Request.Method;
    /**La UrlRule con la que se creo la regla de enrutamiento */
    public urlRule: string;
    /**La función de Autenticación */
    public authExec: Rule.AuthExec;
    /**La expresión regular de la regla de enrutamiento */
    public expression: RegExp;
    /**La contenido de ejecución la regla de enrutamiento */
    public content: Rule.Type[T];
    /**
     * Crea una regla de enrutamiento para ServerCore.
     * @param type El tipo de regla.
     * @param method El método de la petición de la regla.
     * @param urlRule Es la regla que adoptara la clase Rule.
     * @param content El contenido de ejecución de la regla.
     * @param authExec La función de autenticación.
     */
    public constructor(type: T, method: Request.Method, urlRule: string, content: Rule.Type[T], authExec?: Rule.AuthExec) {
        if (!urlRule.startsWith('/')) urlRule = '/' + urlRule;
        if (urlRule.endsWith('/')) urlRule = urlRule.slice(0, -1);
        this.urlRule = urlRule;
        this.type = type;
        this.method = method;
        this.expression = this.getExpression(urlRule);
        this.content = content;
        this.authExec = authExec ?? (() => true);
    }
    /**
     * Ejecuta el contenido de la regla.
     * @param request El Request que coincidió con la regla.
     * @param client El cliente que hizo la petición.
     */
    public exec(request: Request, client: Rule.ClientType<T>): void  {
        request.RuleParams = this.getParams(request.Url);
        if (this.testAuth(request)) switch (this.type) {
            case 'Action':    (this as Rule<'Action'>).content(request, (client as Rule.ClientType<'Action'>)); break;
            case 'File':      (client as Rule.ClientType<'File'>).sendFile((this as Rule<'File'>).content); break;
            case 'Folder':    (client as Rule.ClientType<'Folder'>).sendFolder((this as Rule<'Folder'>).content, this.getSurplus(request.Url)); break;
            case 'WebSocket': (this as Rule<'WebSocket'>).content(request, (client as Rule.ClientType<'WebSocket'>)); break;
        }
    }
    /**
     * Comprueba si una url coincide con esta ruta.
     * también establece los Request.RuleParams.
     * @param request La petición recibida.
     * @param isWebSocket Define si se revisará un WebSocket.
     */
    public test(request: Request, isWebSocket: boolean = false): boolean {
        let result = false;
        if (isWebSocket) {
            result = this.type == 'WebSocket'
            ? this.expression.test(request.Url)
            : false;
        } else {
            result = this.method == request.Method || this.method == 'ALL'
            ? this.expression.test(request.Url)
            : false
        }
        return result;
    }
    /**
     * Comprueba si una url coincide con esta ruta.
     * @param request La petición recibida.
     * @param isWebSocket Define si se revisará un WebSocket.
     */
    public testAuth(request: Request): boolean {
        return !this.authExec || this.authExec(request);
    }
    /**
     * Obtiene los RuleParams de la regla de enrutamiento si esta tiene.
     * @param path La url a resolver.
     */
    public getParams(path: string): Rule.ruleParams {
        const math = this.expression.exec(path);
        if (!math) return {};
        return {...math.groups};
    }
    /**
     * Extrae la Url parcial usando la expresión de la regla.
     * @param url La url de donde se extraerá la url parcial.
     */
    public getSurplus(url: string): string {
        if (this.type == 'Folder') {
            const folderExp = new RegExp(this.expression.source.replace(/\.\+\?\$$/, ''));
            return url.replace(folderExp, '');
        } else return url.replace(this.expression, '');
    }
    /**
     * Crea una expresión regular para poder comprobar con ella las rutas.
     * @param urlRule La UrlRule Con la que se formara la RegExp.
     */
    private getExpression(urlRule: string): RegExp  {
        const validators = {
            param: /^\$(?<param>.+)$/,
            scape: /\\(?![\$\[\]\*\+\?\.\(\)\{\}\^\|\-])|(?<!\\)[\$\[\]\*\+\?\.\(\)\{\}\^\|\-]/gi,
        };
        const zones = urlRule.split('/').slice(1);
        let regExpString = '^';
        for (let index = 0; index < zones.length; index ++) {
            const zone = zones[index];
            regExpString += '\/';
            if (validators.param.test(zone)) {
                const match = validators.param.exec(zone);
                if (match && match.groups) {
                    const param = match.groups['param']
                        .replace(validators.scape, '');
                    regExpString += `(?<${param}>[^\/]+?)`;
                }
            } else if (zone == '*') {
                regExpString += index < (zones.length -1)
                ? '(?:[^\/]+)?'
                : '(?:.+)?';
            } else regExpString += zone;
        }
        regExpString += `\/?${this.type == 'Folder' ? '.+?' : ''}$`;
        return new RegExp(regExpString);
    }
}

export namespace Rule {
    export type AuthExec = (Request: Request) => boolean;
    export type ActionExec = (Request: Request, Response: Response) => void;
    export type WebSocketExec = (Request: Request, WebSocket: WebSocket) => void;
    export type ClientType<T extends keyof Type> = T extends 'WebSocket' ? WebSocket : Response;
    export interface ruleParams {
        [name: string]: string | undefined;
    }
    export type Type = {
        File: string,
        Folder: string,
        Action: ActionExec,
        WebSocket: WebSocketExec
    }
}

export default Rule;