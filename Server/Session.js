/**
* @author diegofmo0802 <diegofmo0802@gmail.com>.
* @description Añade un sistema de sesiones a `Saml/Server-core`.
*/
import CRYPTO from 'crypto';
import EVENTS from 'events';

class Sesión extends EVENTS {
    /**@type {Map<string, any>} Contiene los datos almacenados en la sesión. */
    Datos = null;
    /**@type {Map<string, Sesión>} Contiene las instancias de session. */
    static Sesiones = new Map();
    /**@type {string} Contiene la SS_UUID de la sesión. */
    SS_UUID = null;
    /**
     * Crea/Recupera una instancia de sesión.
     * @param {import('../ServerCore').default.Petición} Petición La petición que recibió el servidor.
	 * @param {import('../ServerCore').default.Respuesta?} Respuesta La respuesta que dará el servidor.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
    */
    constructor(Petición, Respuesta = null) { super();
        if (Petición.Cookies.has('SS_UUID')) {
            let SS_UUID = Petición.Cookies.get('SS_UUID');
            if (Sesión.Sesiones.has(SS_UUID)) return Sesión.Sesiones.get(SS_UUID);
            this.Datos = new Map;
            this.SS_UUID = SS_UUID;
        } else {
            this.Datos = new Map;
            this.SS_UUID = CRYPTO.createHash('SHA512')
            .update(CRYPTO.randomUUID())
            .digest('base64url');
        }
        Sesión.Sesiones.set(this.SS_UUID, this);
        if (Respuesta) Respuesta.HTTPResponse.setHeader('set-cookie', [
            `SS_UUID=${this.SS_UUID}; path=/; secure; httpOnly`
        ]);
    }
    /**
     * Emite el evento `Iniciar`.
     */
    Iniciar() {
        this.emit('Iniciar');
    }
    /**
     * Emite el evento `Cerrar`.
     */
    Cerrar() {
        this.emit('Cerrar');
    }
}
export default Sesión;