/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config manager to the server core.
 * @license Apache-2.0
 */

import Debug from "./Debug.js";

export class Config {
    private static instance: Config;
    private showConfig: Config.ConfigData;
    private saveConfig: Config.ConfigData;
    public debugs: Config.Debugs
    public static getInstance(showConfig?: Config.ConfigData, saveConfig?: Config.ConfigData): Config {
        return this.instance ?? new Config(showConfig, saveConfig);
    }
    private constructor(showConfig: Config.ConfigData = {}, saveConfig: Config.ConfigData = {}) {
        Config.instance = this;
        this.showConfig = showConfig;
        this.saveConfig = saveConfig;
        this.debugs = {
            Mail: Debug.getInstance('mail', '.debug/mail', showConfig.Mail ?? false, this.saveConfig?.Mail ?? false),
            Server: Debug.getInstance('server', '.debug/server', showConfig?.UpgradeRequests ?? false, saveConfig.UpgradeRequests ?? false),
            Requests: Debug.getInstance('server.requests', '.debug/requests', showConfig?.Requests ?? false, saveConfig.Requests ?? false),
            UpgradeRequests: Debug.getInstance('server.webSockets', '.debug/webSockets', showConfig?.UpgradeRequests ?? false, saveConfig.UpgradeRequests ?? false)
        }
    }
    /**
     * set the show config
     * @param showConfig the show config
     */
	public setShowDebug(Config: Config.ConfigData): void {
        this.showConfig = Config;
        this.debugs.Mail.setShow(this.showConfig.Mail ?? false);
        this.debugs.Requests.setShow(this.showConfig.Requests ?? false);
        this.debugs.Server.setShow(this.showConfig.Server ?? false);
        this.debugs.UpgradeRequests.setShow(this.showConfig.UpgradeRequests ?? false);
    }
	public getShowDebug(): Config.ConfigData { return this.showConfig; }
    /**
     * set the save config
     * @param Config La configuración.
     */
	public setSaveDebug(Config: Config.ConfigData): void {
        this.saveConfig = Config;
        this.debugs.Mail.setSave(this.saveConfig.Mail ?? false);
        this.debugs.Requests.setSave(this.saveConfig.Requests ?? false);
        this.debugs.Server.setSave(this.saveConfig.Server ?? false);
        this.debugs.UpgradeRequests.setSave(this.saveConfig.UpgradeRequests ?? false);
    }
	public getSaveDebug(): Config.ConfigData { return this.saveConfig; }
}

export namespace Config {
    export type Debugs = {
		Requests: Debug,
		Mail: Debug,
		UpgradeRequests: Debug,
		Server: Debug
    }
	export type ConfigData = {
		Requests?: boolean,
		Mail?: boolean,
		UpgradeRequests?: boolean,
		Server?: boolean
	}
}

export default Config;