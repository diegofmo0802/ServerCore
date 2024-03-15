const Config = new class Config {
    /** Define que se muestra en consola */
    ShowDebug: Config.Debug;
    /** Define que se guardara dek debug */
    SaveDebug: Config.Debug;
    /**
     * Establece la configuración de ShowDebug
     * @param Config La configuración.
     */
	SetShowDebug(Config: Config.Debug): void
    /** devuelve la configuración de ShowDebug */
	GetShowDebug(): Config.Debug
    /**
     * Establece la configuración de SaveDebug
     * @param Config La configuración.
     */
	SetSaveDebug(Config: Config.Debug): void
    /** devuelve la configuración de SaveDebug */
	GetSaveDebug(): Config.Debug
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