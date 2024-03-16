/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene lo necesario para las reglas de enrutamiento de ServerCore.
 * @license Apache-2.0
 */

import { type } from 'os';
import Request from './Request.js';
import Response from './Response.js';
import WebSocket from './WebSocket.js';

class Rule {
    /**@type {keyof import('./Rule.js').default.Type} El tipo de la regla de enrutamiento */
    Type = null;
    /**@type {Request.Method} El método que aceptara la regla de enrutamiento */
    Method = null;
    /**@type {string} La UrlRule con la que se creo la regla de enrutamiento */
    UrlRule = null;
    /**@type {RegExp} La expresión regular de la regla de enrutamiento */
    Expression = null;
    /**@type {import('./Rule.js').default.AuthExec} La función de Autenticación */
    AuthExec = null;
    /**La contenido de ejecución la regla de enrutamiento */
    Content = null;
    /**
     * Crea una regla de enrutamiento para ServerCore.
     * @param {keyof import('./Rule.js').default.Type} Type El tipo de regla.
     * @param {Request.Method} Method El método de la petición de la regla.
     * @param {string} UrlRule Es la regla que adoptara la clase Rule.
     * @param {import('./Rule.js').default.Type[keyof import('./Rule.js').default.Type]} Content El contenido de ejecución de la regla.
     * @param {import('./Rule.js').default.Type[keyof import('./Rule.js').default.AuthExec]} AuthExec La función de autenticación.
     */
    constructor(Type, Method, UrlRule, Content, AuthExec) {
        if (! UrlRule.startsWith('/')) UrlRule = `/${UrlRule}`;
        if (UrlRule.endsWith('/')) UrlRule = UrlRule.slice(0, -1);
        this.UrlRule = UrlRule;
        this.Type = Type;
        this.Method = Method;
        this.Expression = this.GetExpression(UrlRule);
        this.Content = Content;
        this.AuthExec = AuthExec ?? (() => true);
    }
    /**
     * Ejecuta el contenido de la regla.
     * @param {Request} Request El Request que coincidió con la regla.
     * @param Client El cliente que hizo la petición.
     */
    Exec(Request, Client) {
        Request.RuleParams = this.GetRuleParams(Request.Url);
        if (!this.AuthExec || this.AuthExec) switch (this.Type) {
            case 'Action':    this.Content(Request, Client); break;
            case 'File':      Client.SendFile(this.Content); break;
            case 'Folder':    Client.SendFolder(this.Content, this.GetRelativeUrl(Request.Url)); break;
            case 'WebSocket': this.Content(Request, Client); break;
        }
    }
    /**
     * Comprueba si una url coincide con esta ruta.
     * @param {Request} Request La petición recibida.
     * @param {boolean} isWebSocket Define si se revisará un WebSocket.
     */
    Test(Request, isWebSocket = false) {
        let Result = false;
        if (!this.AuthExec || this.AuthExec(Request)) {
            if (isWebSocket) {
                Result = this.Type == 'WebSocket'
                ? this.Expression.test(Request.Url)
                : false;
            } else {
                Result = this.Method == Request.Method || this.Method == 'ALL'
                ? this.Expression.test(Request.Url)
                : false
            }
        }
        return Result;
    }
    /**
     * Obtiene los RuleParams de la regla de enrutamiento si esta tiene.
     * @param {string} Path La url a resolver.
     * @returns {{ [Name: string]: string }}
     */
    GetRuleParams(Path) {
        const Match = this.Expression.exec(Path);
        if (!Match) return {};
        return {...Match.groups};
    }
    /**
     * Extrae la Url parcial usando la expresión de la regla.
     * @param {string} Url La url de donde se extraerá la url parcial.
     */
    GetRelativeUrl(Url) {
        if (this.Type == 'Folder') {
            const FolderEx = new RegExp(this.Expression.source.replace(/\.\+\?\$$/, ''));
            return Url.replace(FolderEx, '');
        } else return Url.replace(this.Expression, '');
    }
    /**
     * @private
     * Crea una expresión regular para poder comprobar con ella las rutas.
     * @param {string} UrlRule La UrlRule Con la que se formara la RegExp.
     * @returns {RegExp}
     */
    GetExpression(UrlRule) {
        const Comps = {
            Param: /^\$(?<ParamName>.+)$/,
            Escape: /\\(?![\$\[\]\*\+\?\.\(\)\{\}\^\|\-])|(?<!\\)[\$\[\]\*\+\?\.\(\)\{\}\^\|\-]/gi,
        };
        const Zones = UrlRule.split('/').slice(1);
        let FutureRegEx = '^';
        for (const Zone of Zones) {
            FutureRegEx += '\/';
            if (Comps.Param.test(Zone)) {
                const Match = Comps.Param.exec(Zone);
                if (Match && Match.groups) {
                    const ParamName = Match.groups['ParamName']
                        .replace(Comps.Escape, '');
                    FutureRegEx += `(?<${ParamName}>.+)?`;
                }
            } else if (Zone == '*') FutureRegEx += '(?:.+)?';
            else FutureRegEx += Zone;
        }
        FutureRegEx += `\/?${this.Type == 'Folder' ? '.+?' : ''}$`;
        const RuleExp = new RegExp(FutureRegEx);
        return RuleExp;
    }
}

export default Rule;