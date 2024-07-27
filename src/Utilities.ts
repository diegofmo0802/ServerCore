/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description add useful functions to the server core. 
 * @license Apache-2.0
 */

import PATH from 'path';
import URL from 'url';
import FS from 'fs';

export class Path {
    public moduleDir: string;
    public moduleMain: string;
    public constructor() {
        this.moduleDir = PATH.dirname(PATH.dirname(URL.fileURLToPath(import.meta.url)));
        this.moduleMain = PATH.join(this.moduleDir, 'build/ServerCore.js');
    }
    /**
     * clean a path.
     * - replaces all `\` with `/`
     * @param path the path to clean
     * @returns the cleaned path
     */
    public normalize(path: string): string {
        path = path.replace(/[\\/]/gi, PATH.sep);
        return path;
    }
    /**
     * convert a relative path to a full path.
     * @param path the relative path.
     * @returns the full path.
     */
    public relative(path: string): string {
        path = this.normalize(path);
        path =  PATH.join(this.moduleDir, path);
        return PATH.normalize(path);
    }
}

export class Utilities {
    public static Path: Path = new Path;
    /**
     * load the environment variables from the given path
     * @param path the path to the environment variables file
     * @param setEnv whether to set the environment variables
     * @returns the environment variables
     * @throws an error if the environment variables file does not exist
     * @throws an error if the environment variables file is not a file
     */
    public static loadEnv(path: string, setEnv: boolean = true): Utilities.env {
        console.log(`loading environment variables from [${path}]`);
        const result: Utilities.env = {};
        if (!FS.existsSync(path)) throw new Error(`the environment variables file [${path}] does not exist`);
        const env = FS.readFileSync(path, 'utf-8');
        const lines = env.split('\n');
        for (const line of lines) {
            const [key, ...value] = line.split('=');
            if (!key || !value) continue;
            if (key.trim().startsWith('#')) continue;
            result[key] = value.join('=').trim();
            if (setEnv) process.env[key] = value.join('=').trim();
        }
        console.log(`environment variables loaded from [${path}]`);
        return result;
    }
    /**
     * flatten an object into a single level
     * @param object the object to flatten
     * @param prefix the prefix to add to the flattened keys
     * @returns the flattened object
     */
    public static flattenObject(object: Utilities.flattenObject, prefix: string = ''): Utilities.flattenObject {
        const result: Utilities.flattenObject = {};
        for (const key in object) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof object[key] === 'object') {
                Object.assign(result, Utilities.flattenObject(object[key], newKey));
            } else {
                result[newKey] = object[key];
            }
        }
        return result;
    }
    /**
     * sleep for the given number of milliseconds
     * @param ms the number of milliseconds to sleep
     * @returns a promise that resolves after the given number of milliseconds
     */
    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

export namespace Utilities {
    export interface flattenObject {
        [key: string]: any;
    }
    export interface env {
        [key: string]: string;
    }
}


export default Utilities;