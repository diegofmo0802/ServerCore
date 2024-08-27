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
    public static flattenObject<T extends object, D extends number = 10>(object: T, depth: D = 10 as D): Utilities.Flatten.Object<T, D> {
        return this.flattenCore(object, depth);
    }
    protected static flattenCore(object: any, depth: number = 10, prefix: string = ''): any {
        const result: any = {};
        for (const key in object) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            const value = object[key];
            if (typeof value === 'object' && !Array.isArray(value) && value !== null && depth > 0) {
                Object.assign(result, Utilities.flattenCore(value as any, (depth - 1), newKey));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }
    /**
     * unFlatten an object
     * @template Result the type of the unFlattened object
     * @param obj the object to unFlatten
     * @returns the unFlattened object
     */
    public static unFlattenObject<Result extends any = any>(obj: any): Result {
        const result: any = {};
        for (const key in obj) {
            const value = obj[key];
            const [first, ...rest] = key.split('.');
            if (rest.length === 0) result[first] = value;
            else {
                const last = rest.pop() as string;
                const subObj: any = result[first] ?? {};
                let current: any = subObj;
                rest.forEach((key) => {
                    current = current[key] ?? (current[key] = {});
                });
                current[last] = value;
                result[first] = subObj;
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
    export namespace Types {
        type NumListAdd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        type strToNum<str extends string> = str extends `${infer num extends number}` ? num : never;

        /**
         * add one to a number
         * @template Number the number to add one to
         * @returns the number added one
         */
        export type Inc<Number extends number | string> = (
            `${Number}` extends `${infer surPlus}${NumListAdd[number]}`
            ? `${Number}` extends `${surPlus}${infer unit extends number}`
                ? unit extends Exclude<NumListAdd[number], 9>
                    ? strToNum<`${surPlus}${NumListAdd[unit]}`>
                    : strToNum<`${
                        surPlus extends `${infer Num extends number}` ? '' : '1'
                    }${
                        surPlus extends '' ? '' : Inc<surPlus>
                    }${NumListAdd[unit]}`>
                : number
            : number
        );

        /**
         * union to intersection
         * @template U the union to convert
         * @returns the intersection of the union
        */
        export type UnionToIntersection<U extends object> = (
            (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void
            ? I extends object
                ? { [K in keyof I]: I[K] extends object ? UnionToIntersection<I[K]> : I[K] }
                : I
            : never
        );

        /**
         * convert the object property with undefined to optional
         * @template T the object to convert
         * @returns the converted object
         */
        export type undefinedToPartial<T extends object> = {
            [K in keyof T as undefined extends T[K] ? never : K]: T[K];
        } & {
            [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
        };

        export type Document = {
            [key: string]: any;
        };
    }
    export namespace Flatten {
        type ResourceIndexes<Length extends number, Current extends number[] = []> = (
            Current['length'] extends Length
            ? Current[number]
            : ResourceIndexes<Length, [...Current, Current['length']]>
        );
        /**
         * flatten an object into a single level and return an union of all the keys
         * @template T the object to flatten
         * @template depth the depth to flatten
         * @template index the current index
         * @returns the flattened object keys as a union
         */
        type ResourceKeys<T extends Types.Document, depth extends number = 5, index extends number = 1> = {
            [K in keyof T]-?:
            depth extends index
            ? K & string
            : Exclude<T[K], undefined> extends infer U
                ? U extends any[]
                    ? K & string
                    : U extends object
                        ? `${K & string}.${ResourceKeys<U, depth, Types.Inc<index>>}`
                        : K & string
                : "fail_in_flatten_inference"
        }[keyof T];
        /**
         * flatten an object into a single level and return an union of all the keys
         * @template T the object to flatten
         * @template depth the depth to flatten
         * @template index the current index
         * @returns the flattened object keys as a union
         */
        type RecurseObject<T extends Types.Document, Keys extends string> = (
            Keys extends `${infer K}.${infer Rest}`
            ? K extends keyof T
                ? undefined extends T[K]
                    ? RecurseObject<Exclude<T[K], undefined>, Rest> | undefined
                    : RecurseObject<T[K], Rest>
                : never
            : undefined extends T
                ? Keys extends keyof Exclude<T, undefined>
                    ? Exclude<T, undefined>[Keys] | undefined
                    : never
                : Keys extends keyof T
                    ? T[Keys]
                    : never
        );
        /**
         * flatten an object into a single level
         * @template T the object to flatten
         * @template depth the depth to flatten
         * @template index the current index
         * @returns the flattened object
         */
        export type Object<T extends Types.Document, depth extends number = 5, index extends number = 1> = Types.undefinedToPartial<{
            [P in ResourceKeys<T, depth, index>]: RecurseObject<T, P>;
        }>;
        type test = Object<{
            a?: {b:{c:{d:"XD"}}}
        }, 20>;
    }
    export namespace UnFlatten {
        /**
         * split a string by a delimiter
         * @template S the string to split
         * @template Delimiter the delimiter to split by
         * @returns the split string
         */
        type Split<S extends string, Delimiter extends string> = (
            S extends `${infer T}${Delimiter}${infer U}` 
            ? [T, ...Split<U, Delimiter>] 
            : [S]
        );
        /**
         * build a nested object from a string
         * @template Path the path to build
         * @template Value the value to build
         * @returns the nested object
         */
        type BuildNestedObject<Path extends string[], Value> = (
            Path extends [infer Head extends string, ...infer Tail extends string[]]
            ? Types.undefinedToPartial<{ [K in Head]: BuildNestedObject<Tail, Value> }>
            : Value
        );
        /**
         * unFlatten an object into a single level
         * @template T the object to unFlatten
         * @returns the unFlattened object
         */
        export type Object<T extends Types.Document> = Types.UnionToIntersection<Types.undefinedToPartial<({
            [K in keyof T]-?: BuildNestedObject<Split<Extract<K, string>, ".">, T[K]>
        }[keyof T])>>;
    }
    export interface env {
        [key: string]: string;
    }
}


export default Utilities;