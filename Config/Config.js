const Config = new class Config {
    /** @type {import('./Config').default.Debug} Define que se muestra en consola */
    ShowDebug = {};
    /** @type {import('./Config').default.Debug} Define que se guardara dek debug */
    SaveDebug = {};
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