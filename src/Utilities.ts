/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
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
    public static flattenObject<obj extends any>(object: obj, prefix: string = ''): Utilities.flatten.Object<obj> {
        const result: any = {};
        for (const key in object) {
            const value = object[key]
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object')
            Object.assign(result, Utilities.flattenObject(object[key], newKey));
            else result[newKey] = value;
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
    /**
     * encode to base64url
     * @param data the data to encode
     * @returns the encoded data
     */
    public static base64UrlEncode(data: string): string {
        return Buffer.from(data).toString('base64url');
    }
    /**
     * decode from base64url
     * @param data the data to decode
     * @returns the decoded data
     */
    public static base64UrlDecode(data: string): string {
        return Buffer.from(data, 'base64url').toString('utf8');
    }
};

export namespace Utilities {
    export namespace flatten {
        type Flatten<T> = {
            [K in keyof T]: T[K] extends object
                ? `${K & string}.${Flatten<T[K]>}`
                : K & string
        }[keyof T];
        export type Object<T> = {
            [P in Flatten<T>]: P extends `${infer K}.${infer Rest}`
                ? K extends keyof T
                    ? Rest extends Flatten<T[K]>
                        ? Object<T[K]>[Rest]
                        : never
                    : never
                : P extends keyof T
                    ? T[P]
                    : never;
        };
    }
    export interface env {
        [key: string]: string;
    }
}


export default Utilities;