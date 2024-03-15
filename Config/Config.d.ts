const Config = new class Config {
    /** Define que se muestra en consola */
    private ShowDebug: Config.Debug;
    /** Define que se guardara dek debug */
    private SaveDebug: Config.Debug;
    /**
     * Establece la configuración de ShowDebug
     * @param Config La configuración.
     */
	public SetShowDebug(Config: Config.Debug): void
    /** devuelve la configuración de ShowDebug */
	public GetShowDebug(): Config.Debug
    /**
     * Establece la configuración de SaveDebug
     * @param Config La configuración.
     */
	public SetSaveDebug(Config: Config.Debug): void
    /** devuelve la configuración de SaveDebug */
	public GetSaveDebug(): Config.Debug
}

declare namespace Config {
	type Debug = {
		Requests?: boolean,
		Mail?: boolean,
		UpgradeRequests?: boolean,
		Server?: boolean
	}
}

export default Config;