/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config manager to the server core.
 * @license Apache-2.0
 */

import Debug from "./Debug.js";
import Utilities from "./Utilities/Utilities.js";

export class Config {
    private static instance: Config;
    public debugs: Config.Debugs
    public templates: Config.Templates;
    public static getInstance(): Config {
        return this.instance ?? new Config();
    }
    private constructor() {
        Config.instance = this;
        const mail = Debug.getInstance('mail', { path: '.debug/mail' });
        const server = Debug.getInstance('server', { path: '.debug/server' });
        const requests = Debug.getInstance('server.requests', { path: '.debug/requests' });
        const webSocket = Debug.getInstance('server.webSockets', { path: '.debug/webSockets' });
        this.debugs = { mail, server, requests, webSocket: webSocket };
        this.templates = {
            folder: Utilities.Path.relative('./global/Template/Folder.HSaml'),
            error: Utilities.Path.relative('./global/Template/Error.HSaml')
        };
    }
    public get showAll(): boolean { return Debug.showAll; }
    public set showAll(value: boolean) { Debug.showAll = value; }
}

export namespace Config {
    export interface Debugs {
		requests: Debug;
		mail: Debug;
		webSocket: Debug;
		server: Debug;
    }
    export interface Templates {
        folder?: string;
        error?: string;
        [key: string]: string | undefined;
    }
}

export default Config;