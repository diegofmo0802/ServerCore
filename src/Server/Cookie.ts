/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Añade un sistema de cookies a `Saml/Server-core`.
 * @license Apache-2.0
 */

export class Cookie {
    private data: Map<string, string>;
    private news: Map<string, Cookie.SetData>;
    /**
     * Recupera las cookies de los encabezados.
     * @param cookieHeader El encabezado Cookie
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
     * Comprueba si una cookie existe.
     * @param name El nombre de la cookie que desea buscar.
     */
    public has(name: string): boolean { return this.data.has(name); }
    /**
     * Recupera una cookie si esta existe.
     * @param name El nombre de la cookie que desea buscar.
     */
    public get(name: string): string | undefined { return this.data.get(name); };
    /**
     * Devuelve un objeto con todas las cookies
     * - Este objeto no esta vinculado, cualquier cambio en el
     *   No se vera reflejado en las cookies.
     */
    public getAll(): Cookie.CookieObject { 
        const cookies: Cookie.CookieObject = {};
        this.data.forEach((value, key) => cookies[key] = value);
        return cookies;
     }
    /** 
     * Devuelve un array con los valores de los encabezados "Set-Cookie".
     */
    public getSetters(): string[]  {
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
     * Establece/Reemplaza una cookie
     * @param name El nombre de la cookie que desea establecer.
     * @param value El valor que se le asignara.
     * @param options Las opciones de la cookie.
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
     * Elimina una cookie.
     * @param name El nombre de la cookie que desea eliminar.
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
        domain?: string,
        expires?: Date,
        httpOnly?: boolean,
        path?: string,
        sameSite?: 'Strict' | 'Lax' | 'None'
        maxAge?: number,
        secure?: boolean
    }
    export type SetData = (SetOptions & {
        delete: false,
        value: string
    }) | {
        delete: true
    };
}

export default Cookie;