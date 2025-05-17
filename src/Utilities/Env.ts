import { promises as FS } from "fs";
import PATH from "path";

import Debug from "../Debug.js";

export class Env {
    public static get variables(): Env.EnvList { return process.env; }
    /**
     * Check if a file exists
     * @param path - The path to the file
     * @returns A promise that resolves to true if the file exists, false otherwise
     */
    public static async fileExists(path: string): Promise<boolean> {
        return FS.access(path).then(() => true).catch(() => false);
    }
    /**
     * Load the environment variables from the given path
     * @param path - The path to the environment variables file
     * @param options - Options to load the environment variables
     * @returns The loaded environment variables as an object
     * @throws Error if the environment variables file does not exist and cannot be created
     * @throws Error if the environment variables file is not readable
     */
    public static async load(path: string, options: Env.LoadOptions = {}): Promise<Env.EnvList> {
        Debug.log(`loading environment variables from &C6[${path}]`);
        const defaultEnv = options.defaultEnv ?? {};
        const setEnv = options.setEnv ?? true;
        const result: Env.EnvList = { ...defaultEnv };

        if (!await this.fileExists(path)) {
            await FS.mkdir(PATH.dirname(path), { recursive: true });
            const env = this.toEnv(defaultEnv);
            await FS.writeFile(path, env, 'utf-8');
            Debug.log(`environment variables file &C6[${path}]&R does not exist, creating it`);
        }

        const env = await FS.readFile(path, 'utf-8');
        const lines = env.split('\n');

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

        if (setEnv) this.setMany(result);

        Debug.log(`environment variables loaded from &C6[${path}]`);
        return result;
    }
    /**
     * Get the value of an environment variable
     * @param key - The environment variable key
     * @returns The value of the environment variable or undefined if not set
     */
    public static get(key: string): string | undefined {
        return process.env[key];
    }
    /**
     * Set an environment variable
     * @param key - The environment variable key
     * @param value - The value to set
     */
    public static set(key: string, value: string): void {
        process.env[key] = value;
    }
    /**
     * Set multiple environment variables at once
     * @param env - An object containing key-value pairs of environment variables
     */
    public static setMany(env: Env.EnvList): void {
        for (const key in env) process.env[key] = env[key] ?? '';
    }
    /**
     * Delete an environment variable
     * @param key - The environment variable key to delete
     */
    public static delete(key: string): void {
        delete process.env[key];
    }
    /**
     * Convert an EnvList to a .env-formatted string
     * @param env - The environment variables object
     * @returns A string in .env format
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
}
export default Env;