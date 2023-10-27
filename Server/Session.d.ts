/**
* @author diegofmo0802 <diegofmo0802@gmail.com>.
* @description Añade un sistema de sesiones a `Saml/Server-core`.
*/

import EVENTS from 'events';
import Request from './Request.js';
import Response from './Response.js';

export class Sesión extends EVENTS {
    /**Contiene los datos almacenados en la sesión. */
    public Datos: Map<string, any>;
    /**Contiene las instancias de session. */
    public static Sesiones: Map<string, Sesión>;
    /**Contiene la SS_UUID de la sesión. */
    public SS_UUID: string;
    /**
     * Crea/Recupera una instancia de sesión.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
     * @param Petición La petición que recibió el servidor.
	 * @param Respuesta La respuesta que dará el servidor.
    */
    public constructor(Petición: Request, Respuesta?: Respuesta);
    /**Emite el evento `Iniciar`.*/
    Iniciar(): void;
    /**Emite el evento `Cerrar`.*/
    Cerrar(): void;
    on(Evento: 'Iniciar',   Acción: () => void) : this;
    on(Evento: 'Cerrar',    Acción: () => void) : this;
}
export default Sesión;