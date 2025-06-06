/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config manager to the server core.
 * @license Apache-2.0
 */

import Debug from "../Debug.js";
import LoggerManager from "../LoggerManager/LoggerManager.js";
import Utilities from "../Utilities/Utilities.js";
import _ConfigLoader from "./ConfigLoader.js";
import _ConfigValidator from "./ConfigValidator.js";


export class Config implements Config.Main {
    public static readonly DEFAULT: Config.Main = {
        host: 'localhost',
        port: 80,
        ssl: null,
        templates: Config.defaultTemplates()
    };
    public templates: Config.Templates;
    public host: string;
    public port: number;
    public logger: LoggerManager;
    public ssl: Config.SSLOptions | null;
    public constructor(options: Config.options = {}) {
        this.host = options.host ?? Config.DEFAULT.host;
        this.port = options.port ?? Config.DEFAULT.port;
        this.ssl = options.ssl ?? Config.DEFAULT.ssl;
        this.logger = LoggerManager.getInstance();
        this.templates = options.templates ?? Config.defaultTemplates();
    }
    public get showAll(): boolean { return Debug.showAll; }
    public set showAll(value: boolean) { Debug.showAll = value; }
    /**
     * Converts the config to a JSON string.
     * @returns The JSON string.
     */
    public toJson(): string {
        const { host, port, ssl, templates } = this;
        const config: Config.Main = { host, port, ssl, templates };
        const content = JSON.stringify(config, null, 4);
        return content;
    }
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
        templates: Templates;
    }
    export type options = Partial<Main>;
}
export namespace Config {
    export import Loader = _ConfigLoader;
    export import Validator = _ConfigValidator;
}
export default Config;