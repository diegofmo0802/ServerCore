import FS, { promises as FSP } from "fs";
import PATH from "path";

import Debug from "../Debug.js";
import Utilities from "./Utilities.js";

export class Env {
    /**
     * Gets all current environment variables.
     * @returns An object containing key-value pairs of environment variables.
     */
    public static get data(): Env.EnvList { return process.env; }
    /**
     * Load the environment variables from the given path.
     * @param path - The path to the environment variables file.
     * @param options - Options to load the environment variables.
     * @returns A promise that resolves with the loaded environment variables as an object.
     * @throws Error if the environment variables file does not exist and cannot be created.
     * @throws Error if the environment variables file is not readable.
     */
    public static async load(path: string, options: Env.LoadOptions = {}): Promise<Env.EnvList> {
        Debug.log(`loading environment variables from &C6[${path}]`);
        const defaultEnv = options.defaultEnv ?? {};
        const setEnv = options.setEnv ?? true;

        if (!await Utilities.fileExists(path)) {
            try {
                Debug.log(`environment variables file &C6[${path}]&R does not exist, creating it`);
                await FSP.mkdir(PATH.dirname(path), { recursive: true });
                const env = this.toEnv(defaultEnv);
                await FSP.writeFile(path, env, 'utf-8');
                Debug.log(`environment variables file &C6[${path}]&R &C2was created successfully`);
            } catch (error) {
                Debug.log(`environment variables file &C6[${path}]&R &C1could not be created`);
                throw error;
            }
        }

        const env = await FSP.readFile(path, 'utf-8');
        const result = this.extractEnv(env, defaultEnv);
        if (setEnv) this.setMany(result);

        Debug.log(`environment variables loaded from &C6[${path}]`);
        return result;
    }
    /**
     * Load the environment variables from the given path synchronously.
     * @param path - The path to the environment variables file.
     * @param options - Options to load the environment variables.
     * @returns The loaded environment variables as an object.
     * @throws Error if the environment variables file does not exist and cannot be created.
     * @throws Error if the environment variables file is not readable.
     */
    public static loadSync(path: string, options: Env.LoadOptions = {}): Env.EnvList {
        Debug.log(`loading environment variables from &C6[${path}]`);
        const defaultEnv = options.defaultEnv ?? {};
        const setEnv = options.setEnv ?? true;

        if (!FS.existsSync(path)) {
            FS.mkdirSync(PATH.dirname(path), { recursive: true });
            const env = this.toEnv(defaultEnv);
            FS.writeFileSync(path, env, 'utf-8');
            Debug.log(`environment variables file &C6[${path}]&R does not exist, creating it`);
        }

        const env = FS.readFileSync(path, 'utf-8');
        const result = this.extractEnv(env, defaultEnv);
        if (setEnv) this.setMany(result);

        Debug.log(`environment variables loaded from &C6[${path}]`);
        return result;
    }
    /**
     * Extract the environment variables from the given content.
     * @param content - The content to extract the environment variables from.
     * @param defaultEnv - An optional object of default environment variables to include if not present in the content.
     * @returns An object containing the extracted environment variables merged with defaults.
     */
    private static extractEnv(content: string, defaultEnv: Env.EnvList = {}): Env.EnvList {
        const lines = content.split('\n');
        const result: Env.EnvList = { ...defaultEnv };
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;

            const index = trimmedLine.indexOf('=');
            if (index === -1) continue;

            const key = trimmedLine.substring(0, index).trim();
            const value = trimmedLine.substring(index + 1).trim();
            if (!key) continue;

            result[key] = value;
        }
        return result;
    }
    /**
     * Get the value of an environment variable.
     * @param key - The key of the environment variable to get.
     * @param options - Options to get the environment variable.
     * @param options.default - The default value to return if the environment variable is not set.
     * @param options.warning - If `true`, a warning will be logged if the environment variable is not set.
     * @returns The value of the environment variable or undefined if not set.
     */
    public static get(key: string, options: Env.getOptionsGranted): string;
    public static get(key: string, options: Env.getOptions): string | undefined
    public static get(key: string, options: Env.getOptions = {}): string | undefined {
        const value = process.env[key];
        if (value) return value;
        const { default: defaultVal, warning = false } = options;
        if (warning) Debug.log(`&B3[warn]:&R &C6${key} &C3is not defined${defaultVal ? `, &C2using: &C6${defaultVal}` : ''}`);
        return defaultVal;
    }
    /**
     * Set an environment variable.
     * @param key - The key of the environment variable to set.
     * @param value - The value to set for the environment variable.
     */
    public static set(key: string, value: string): void {
        process.env[key] = value;
    }
    /**
     * Sets multiple environment variables from an object.
     * @param env - An object containing key-value pairs of environment variables to set.
     */
    public static setMany(env: Env.EnvList): void {
        for (const key in env) process.env[key] = env[key] ?? '';
    }
    /**
     * Delete an environment variable.
     * @param key - The key of the environment variable to delete.
     */
    public static delete(key: string): void {
        delete process.env[key];
    }
    /**
     * Convert an EnvList to a .env-formatted string.
     * @param env - The environment variables object.
     * @returns A string in .env format.
     */
    public static toEnv(env: Env.EnvList): string {
        const filtered = Object.entries(env).filter(([key, value]) => typeof key === 'string' && typeof value === 'string');
        return filtered.map(([key, value]) => `${key}=${value}`).join('\n');
    }
}
export namespace Env {
    export interface EnvList {
        [key: string]: string | undefined;
    }
    export interface LoadOptions {
        setEnv?: boolean;
        defaultEnv?: EnvList;
    }
    export interface getOptions {
        default?: string;
        warning?: boolean;
    }
    export type getOptionsGranted = getOptions & { default: string };
}
export default Env;