/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de sesiones a `Saml/Server-core`.
 * @license Apache-2.0
 */

import EVENTS from 'events';
import Request from './Request.js';
import Response from './Response.js';

export class Session extends EVENTS {
    /**Contiene los datos almacenados en la sesión. */
    public Data: Map<string, any>;
    /**Contiene las instancias de session. */
    public static Sessions: Map<string, Session>;
    /**Contiene la SS_UUID de la sesión. */
    public SS_UUID: string;
    /**
     * Crea/Recupera una instancia de sesión.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
     * @param Request La petición que recibió el servidor.
	 * @param Response La respuesta que dará el servidor.
    */
    public constructor(Request: Request, Response?: Respuesta);
    /**Emite el evento `Iniciar`.*/
    Start(): void;
    /**Emite el evento `Cerrar`.*/
    Close(): void;
    on(Evento: 'Start',   Acción: () => void) : this;
    on(Evento: 'Close',    Acción: () => void) : this;
}

export default Session;