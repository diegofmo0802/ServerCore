/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config loader to the server core.
 * @license Apache-2.0
 */

import { promises as FSP } from "fs";
import Logger from "../LoggerManager/Logger.js";
import Config from "./Config.js";
import Utilities from "../Utilities/Utilities.js";
import { ConfigValidators } from "./ConfigValidator.js";

const $config = new Logger({ prefix: 'Config' });

export class ConfigLoader {
    /**
     * Loads the config from the given path.
     * @param path - The path to the config file.
     * @param defaultConfig - The default config to use if the config file does not exist.
     * @returns A promise that resolves with the loaded config.
     */
    public static async load(path: string, defaultConfig: Config | Config.options = {}): Promise<Config> {
        $config.log(`loading config from &C6[${path}]`);
        if (!await Utilities.fileExists(path)) {
            const config = new Config(defaultConfig);
            $config.log(`config file &C6[${path}]&R does not exist, creating it`);
            await ConfigLoader.save(path, config);
            $config.log(`config file &C6[${path}]&R &C2was created successfully`);
            return config;
        }
        try {
            const content = await FSP.readFile(path, 'utf8');
            const data = JSON.parse(content);
            const validatedConfig = ConfigValidators.validate(data);
            return new Config(validatedConfig);
        } catch (error) {
            $config.error(`config file &C6[${path}]&R &C1could not be loaded`);
            throw error;
        }
    }
    /**
     * Saves the config to the given path.
     * @param path - The path to the config file.
     * @param config - The config to save.
     * @returns A promise that resolves when the config is saved.
     */
    public static async save(path: string, config: Config): Promise<void> {
        const dir = Utilities.Path.dirname(path);
        await FSP.mkdir(dir, { recursive: true });
        const content = config.toJson();
        await FSP.writeFile(path, content, 'utf8');
    }
}
export namespace ConfigLoader {}
export default ConfigLoader;