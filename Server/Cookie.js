/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de cookies a `Saml/Server-core`.
 * @license Apache-2.0
 */

class Cookie {
    /** @type {Map<string, string>} Las cookies*/
    Data = new Map();
    /** @type {Map<string, import('./Cookie').default.SetData>} Las cookies que se establecerán*/
    SetNow = new Map();
    /**
     * Recupera las cookies de los encabezados.
     * @param {string} Cookie El encabezado Cookie
    */
    constructor(Cookie) {
		if (Cookie) {
            let Division = Cookie.split(';');
            for (let Part of Division) {
                let [Name, ...Value] = Part.split('=');
                this.Data.set(Name.trim(), Value.join('='));
            }
        }
    }
    /**
     * Comprueba si una cookie existe.
     * @param {string} Name El nombre de la cookie que desea buscar.
     */
    Has(Name) { return this.Data.has(Name); }
    /**
     * Recupera una cookie si esta existe.
     * @param {string} Name El nombre de la cookie que desea buscar.
     */
    Get(Name) { return this.Data.get(Name) ?? null; }
    /**
     * Devuelve un objeto con todos los datos de la session.
     * - Este objeto no esta vinculado, cualquier cambio en el
     *   No se vera reflejado en la sesión.
     */
    GetAll() { 
        let Data = {};
        this.Data.forEach((Value, Key) => {
            Data[Key] = Value;
        });
        return Data;
     }
    /**
     * Devuelve un array con los valores de los encabezados "Set-Cookie".
     */
    GetSetters() {
        let Setters = [];
        this.SetNow.forEach((Value, Name) => {
            if (Value.Delete == true) {
                Setters.push(`${Name}=None;Expires=${(new Date).toUTCString()}`);
            } else {
                let Setter = `${Name}=${Value.Value}`;
                Setter += Value.Expires  ? `;Expires=${Value.Expires.toUTCString()}` : '';
                Setter += Value.HttpOnly ? ';HttpOnly' : '';
                Setter += Value.Secure   ? ';Secure' : '';
                Setters.push(Setter);
            }
        });
        return Setters;
    }
    /**
     * Establece/Reemplaza una cookie
     * @param {string} Name El nombre de la cookie que desea establecer.
     * @param {any} Value El valor que se le asignara.
     * @param {import('./Cookie').default.SetOptions} Options Las opciones de la cookie.
     */
    Set(Name, Value, Options = {}) {
        this.SetNow.set(Name, {
            Delete: false,
            Expires:  Options.Expires  ?? null,
            HttpOnly: Options.HttpOnly ?? false,
            Secure:   Options.Secure   ?? false,
            Value: Value
        });
        this.Data.set(Name, Value);
    }
    /**
     * Elimina una cookie.
     * @param {string} Name El nombre de la cookie que desea eliminar.
     */
    Del(Name) {
        this.Data.delete(Name);
        this.SetNow.set(Name, { Delete: true });
    }
}

export default Cookie;