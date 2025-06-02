/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config manager to the server core.
 * @license Apache-2.0
 */

import Debug from "./Debug.js";
import LoggerManager from "./LoggerManager/LoggerManager.js";
import Utilities from "./Utilities/Utilities.js";

export class Config implements Config.Main {
    public templates: Config.Templates;
    public host: string;
    public port: number;
    public logger: LoggerManager;
    public ssl: Config.SSLOptions | null;
    public static instance: Config;
    public constructor(options: Config.options = {}) {
        this.host = options.host ?? 'localhost';
        this.port = options.port ?? 80;
        this.ssl = options.ssl ?? null;
        this.logger = options.logger ?? LoggerManager.getInstance();
        this.templates = options.templates ?? Config.defaultTemplates();
    }
    public get showAll(): boolean { return Debug.showAll; }
    public set showAll(value: boolean) { Debug.showAll = value; }
    /**
     * Get the default templates.
     * @returns The default templates.
     */
    public static defaultTemplates(): Config.Templates {
        return {
            folder: Utilities.Path.relative('./global/Template/Folder.HSaml'),
            error: Utilities.Path.relative('./global/Template/Error.HSaml')
        };
    }
}

export namespace Config {
    export interface Templates {
        folder?: string;
        error?: string;
        [key: string]: string | undefined;
    }
	export type SSLOptions = {
        pubKey: string,
		privKey: string,
		port?: number
    };
    export interface Main {
        host: string;
        port: number;
        ssl: SSLOptions | null;
        logger: LoggerManager;
        templates: Templates;
    }
    export type options = Partial<Main>;
}

export default Config;