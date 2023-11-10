/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de cookies a `Saml/Server-core`.
 * @license Apache-2.0
 */

namespace Cookie {
    type SetOptions = {
        HttpOnly?: boolean,
        Secure?: boolean,
        Expires?: Date,
    }
    type SetData = ({
        Delete: false,
        Expires: Date | null,
        HttpOnly: boolean,
        Secure: boolean,
        Value: string
    } | {
        Delete: true
    });
}

declare class Cookie {
    private Data: Map<string, string>;
    private SetNow: Map<string, Cookie.SetData>;
    /**
     * Recupera las cookies de los encabezados.
     * @param Cookie El encabezado Cookie
    */
    public constructor(Cookie: string);
    /**
     * Comprueba si una cookie existe.
     * @param Name El nombre de la cookie que desea buscar.
     */
    public Has(Name: string): boolean;
    /**
     * Recupera una cookie si esta existe.
     * @param Name El nombre de la cookie que desea buscar.
     */
    public Get(Name: string): any | null;
    /**
     * Devuelve un objeto con todas las cookies
     * - Este objeto no esta vinculado, cualquier cambio en el
     *   No se vera reflejado en las cookies.
     */
    public GetAll(): object;
    /**
     * Establece/Reemplaza una cookie
     * @param Name El nombre de la cookie que desea establecer.
     * @param Value El valor que se le asignara.
     * @param Options Las opciones de la cookie.
     */
    public Set(Name: string, Value: any, Options?: Cookie.SetOptions): void;
    /**
     * Elimina una cookie.
     * @param Name El nombre de la cookie que desea eliminar.
     */
    public Del(Name: string): void;
}

export default Cookie;