/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de sesiones a `Saml/Server-core`.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';
import EVENTS from 'events';

class Session extends EVENTS {
    /**@type {Map<string, any>} Contiene los datos almacenados en la sesión. */
    Data = new Map();
    /**@type {Map<string, Session>} Contiene las instancias de session. */
    static Sessions = new Map();
    /**@type {string} Contiene la SS_UUID de la sesión. */
    SS_UUID = null;
    /**
     * Crea/Recupera una instancia de sesión.
     * @param {import('../ServerCore').default.Request} Request La petición que recibió el servidor.
	 * @param {import('../ServerCore').default.Response?} Response La respuesta que dará el servidor.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
    */
    constructor(Request, Response = null) { super();
        if (Request.Cookies.Has('SS_UUID')) {
            let SS_UUID = Request.Cookies.Get('SS_UUID');
            if (Session.Sessions.has(SS_UUID)) {
                return Session.Sessions.get(SS_UUID);
            } else {
                this.SS_UUID = SS_UUID;
            }
        } else {
            this.SS_UUID = CRYPTO.randomUUID();
        }
        Session.Sessions.set(this.SS_UUID, this);
        if (Response) {
            Response.HTTPResponse.setHeader('set-cookie', [
                `SS_UUID=${this.SS_UUID}; secure; httpOnly`
            ]);
        }
    }
    
    /**
     * Devuelve el SS_UUID de la sesión.
    */
    GetID() { return this.SS_UUID; };
    /**
     * Comprueba si un dato existe en la sesión.
     * @param {string} Name El nombre (key) del dato que desea buscar.
     */
    Has(Name) { return this.Data.has(Name); }
    /**
     * Recupera un dato de la sesión si este existe.
     * @param {string} Name El nombre (key) del dato que desea buscar.
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
     * Establece/Reemplaza un dato de la sesión.
     * @param {string} Name El nombre (key) del dato que desea buscar.
     * @param {any} Value El valor que se asignara.
     */
    Set(Name, Value) { this.Data.set(Name, Value); }
    /**
     * Elimina un dato de la sesión si este existe.
     * @param {string} Name El nombre (key) del dato que desea buscar.
     */
    Del(Name) { this.Data.delete(Name); }
}
export default Session;