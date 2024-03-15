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
	SetShowDebug(Config) { this.ShowDebug = Config; }
    /** devuelve la configuración de ShowDebug */
	GetShowDebug() { return this.ShowDebug }
    /**
     * Establece la configuración de SaveDebug
     * @param {import('./Config').default.Debug} Config La configuración.
     */
	SetSaveDebug(Config) { this.SaveDebug = Config; }
    /** devuelve la configuración de SaveDebug */
	GetSaveDebug() { return this.SaveDebug }
}

export default Config;