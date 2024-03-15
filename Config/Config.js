import { Debug } from '../ServerCore';

const Config = new class Config {
    /** @type {import('./Config').default.Debug} Define que se muestra en consola */
    ShowDebug = {};
    /** @type {import('./Config').default.Debug} Define que se guardara dek debug */
    SaveDebug = {};
    /**@type {import('./Config').default.Debugs} Las instancias de debugs para el servidor */
    Debugs = null;
    constructor() {
        this.Debugs = {
            Mail: new Debug('Mail', '.Debug/Mail', this.ShowDebug?.Mail ?? false, this.SaveDebug?.Mail ?? false),
            Requests: new Debug('Srv.Requests', '.Debug/Requests', this.ShowDebug?.Requests ?? false, this.SaveDebug?.Requests ?? false),
            Server: new Debug('Server', '.Debug/UpgradeRequests', this.ShowDebug?.UpgradeRequests ?? false, this.SaveDebug?.UpgradeRequests ?? false),
            UpgradeRequests: new Debug('Srv.UpgradeRequests', '.Debug/UpgradeRequests', this.ShowDebug?.UpgradeRequests ?? false, this.SaveDebug?.UpgradeRequests ?? false)
        }
    }
    /**
     * Establece la configuración de ShowDebug
     * @param {import('./Config').default.Debug} Config La configuración.
     */
	SetShowDebug(Config) {
        this.ShowDebug = Config;
        this.Debugs.Mail.SetInCOnsole(this.ShowDebug.Mail ?? false);
        this.Debugs.Requests.SetInCOnsole(this.ShowDebug.Requests ?? false);
        this.Debugs.Server.SetInCOnsole(this.ShowDebug.Server ?? false);
        this.Debugs.UpgradeRequests.SetInCOnsole(this.ShowDebug.UpgradeRequests ?? false);
    }
    /**
     * Establece la configuración de SaveDebug
     * @param {import('./Config').default.Debug} Config La configuración.
     */
	SetSaveDebug(Config) {
        this.SaveDebug = Config;
        this.Debugs.Mail.SetInFile(this.SaveDebug.Mail ?? false);
        this.Debugs.Requests.SetInFile(this.SaveDebug.Requests ?? false);
        this.Debugs.Server.SetInFile(this.SaveDebug.Server ?? false);
        this.Debugs.UpgradeRequests.SetInFile(this.SaveDebug.UpgradeRequests ?? false);
    }
    /** devuelve la configuración de ShowDebug */
	GetShowDebug() { return this.ShowDebug }
    /** devuelve la configuración de SaveDebug */
	GetSaveDebug() { return this.SaveDebug }
}

export default Config;