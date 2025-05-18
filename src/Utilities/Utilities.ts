/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add useful functions to the server core. 
 * @license Apache-2.0
 */
import _Path from './Path.js';
import _Env from './Env.js';

export class Utilities {
    /**
     * Deeply compares two objects.
     * @param obj1 - The first object to compare
     * @param obj2 - The second object to compare
     * @returns True if the objects are equal, false otherwise
     */
    public static deepEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true;
        if (
            typeof obj1 !== typeof obj2 ||
            obj1 === null || obj2 === null
        ) return false;
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) if (
            !keys2.includes(key) ||
            !this.deepEqual(obj1[key], obj2[key])
        ) return false;
        return true;
    }
    /**
     * Flattens an object into a single-level object.
     * @param object - The object to flatten
     * @param depth - Maximum depth to flatten (default: 10)
     * @returns The flattened object
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
                Object.assign(result, Utilities.flattenCore(value, depth - 1, newKey));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }
    /**
     * Reconstructs a nested object from a flattened one.
     * @template Result - The type of the unflattened object
     * @param obj - The object to unflatten
     * @returns The unflattened object
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
                rest.forEach((k) => {
                    current = current[k] ?? (current[k] = {});
                });
                current[last] = value;
                result[first] = subObj;
            }
        }
        return result;
    }
    /**
     * Delays execution for the specified number of milliseconds.
     * @param ms - The number of milliseconds to wait
     * @returns A promise that resolves after the given time
     */
    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Encodes a string to base64url format.
     * @param data - The string to encode
     * @returns The base64url-encoded string
     */
    public static base64UrlEncode(data: string): string {
        return Buffer.from(data).toString('base64url');
    }
    /**
     * Decodes a base64url-encoded string.
     * @param data - The base64url-encoded string to decode
     * @returns The decoded string
     */
    public static base64UrlDecode(data: string): string {
        return Buffer.from(data, 'base64url').toString('utf8');
    }
}

export namespace Utilities {
    export import Path = _Path;
    export import Env = _Env;
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