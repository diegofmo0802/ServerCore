/** 
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds a cookie system to `Saml/Server-core`.
 * @license Apache-2.0
 */

export class Cookie {
    /** Contains the all the data of the session */
    private data: Map<string, string>;
    /** Contains the news data of the session */
    private news: Map<string, Cookie.SetData>;
    /**
     * Parses cookies from the "Cookie" header.
     * @param cookieHeader - The Cookie header string.
     */
    public constructor(cookieHeader?: string) {
        this.data = new Map();
        this.news = new Map();
        if (!cookieHeader) return;
        const cookies = cookieHeader.split(';');
        for (const cookie of cookies) {
            const [name, ...value] = cookie.split('=');
            this.data.set(name.trim(), value.join('=').trim());
        }
    }
    /**
     * Checks if a cookie exists.
     * @param name - The name of the cookie to check.
     * @returns True if the cookie exists, otherwise false.
     */
    public has(name: string): boolean { return this.data.has(name); }
    /**
     * Retrieves a cookie by name.
     * @param name - The name of the cookie to retrieve.
     * @returns The cookie value or undefined if not found.
     */
    public get(name: string): string | undefined { return this.data.get(name); }
    /**
     * Returns an object with all parsed cookies.
     * - This object is not reactive: changes will not be reflected.
     * @returns A plain object of cookies.
     */
    public getAll(): Cookie.CookieObject {
        const cookies: Cookie.CookieObject = {};
        this.data.forEach((value, key) => cookies[key] = value);
        return cookies;
    }
    /**
     * Returns an array of "Set-Cookie" header strings.
     * @returns An array of formatted Set-Cookie strings.
     */
    public getSetters(): string[] {
        const setStrings: string[] = [];
        this.news.forEach((value, name) => {
            if (value.delete) {
                setStrings.push(`${name}=None;Path=/;Expires=${(new Date).toUTCString()}`);
            } else {
                let setter = `${name}=${value.value}`;
                setter += value.domain   ? `;Domain=${value.domain}`                 : '';
                setter += value.expires  ? `;Expires=${value.expires.toUTCString()}` : '';
                setter += value.httpOnly ? ';HttpOnly'                               : '';
                setter += value.maxAge   ? `;Max-Age=${value.maxAge}`                : '';
                setter += value.path     ? `;Path=${value.path}`                     : '';
                setter += value.sameSite ? `;SameSite=${value.sameSite}`             : '';
                setter += value.secure   ? ';Secure'                                 : '';
                setStrings.push(setter);
            }
        });
        return setStrings;
    }
    /**
     * Sets or replaces a cookie.
     * @param name - The name of the cookie to set.
     * @param value - The value to assign to the cookie.
     * @param options - Optional settings for the cookie.
     */
    public set(name: string, value: string, options: Cookie.SetOptions = {}): void {
        this.news.set(name, {
            delete: false,
            domain:   options.domain   ?? undefined,
            expires:  options.expires  ?? undefined,
            httpOnly: options.httpOnly ?? undefined,
            maxAge:   options.maxAge   ?? undefined,
            path:     options.path     ?? undefined,
            sameSite: options.sameSite ?? undefined,
            secure:   options.secure   ?? undefined,
            value: value
        });
        this.data.set(name, value);
    }
    /**
     * Deletes a cookie.
     * @param name - The name of the cookie to delete.
     */
    public delete(name: string): void {
        this.data.delete(name);
        this.news.set(name, { delete: true });
    }
}

export namespace Cookie {
    export interface CookieObject {
        [key: string]: string | undefined;
    }
    export interface SetOptions {
        domain?: string;
        expires?: Date;
        httpOnly?: boolean;
        path?: string;
        sameSite?: 'Strict' | 'Lax' | 'None';
        maxAge?: number;
        secure?: boolean;
    }
    export type SetData = (SetOptions & {
        delete: false;
        value: string;
    }) | {
        delete: true;
    };
}

export default Cookie;