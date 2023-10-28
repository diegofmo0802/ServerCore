/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de sesiones a `Saml/Server-core`.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';
import EVENTS from 'events';

class Session extends EVENTS {
    /**@type {Map<string, any>} Contiene los datos almacenados en la sesión. */
    Data = null;
    /**@type {Map<string, Session>} Contiene las instancias de session. */
    static Sessions = new Map();
    /**@type {string} Contiene la SS_UUID de la sesión. */
    SS_UUID = null;
    /**
     * Crea/Recupera una instancia de sesión.
     * @param {import('../ServerCore').default.Petición} Request La petición que recibió el servidor.
	 * @param {import('../ServerCore').default.Respuesta?} Response La respuesta que dará el servidor.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
    */
    constructor(Request, Response = null) { super();
        if (Request.Cookies.has('SS_UUID')) {
            let SS_UUID = Request.Cookies.get('SS_UUID');
            if (Session.Sessions.has(SS_UUID)) return Session.Sessions.get(SS_UUID);
            this.Data = new Map();
            this.SS_UUID = SS_UUID;
        } else {
            this.Data = new Map();
            this.SS_UUID = CRYPTO.createHash('SHA512')
            .update(CRYPTO.randomUUID())
            .digest('base64url');
        }
        Session.Sessions.set(this.SS_UUID, this);
        if (Response) Response.HTTPResponse.setHeader('set-cookie', [
            `SS_UUID=${this.SS_UUID}; path=/; secure; httpOnly`
        ]);
    }
    /**
     * Emite el evento `Iniciar`.
     */
    Start() {
        this.emit('Start');
    }
    /**
     * Emite el evento `Cerrar`.
     */
    Close() {
        this.emit('Close');
    }
}
export default Session;