/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade un sistema de sesiones a `Saml/Server-core`.
 * @license Apache-2.0
 */

// Nota: se podría guardar de forma persistente en el futuro.
// Nota: se debe comprobar la validez de una ss_uuid ya que
    //   si existe un cookie 'SS_UUID' y esta ss_uuid no esta en el
    //   objeto 'sessions' se creara un objeto con dicha ss_uuid aunque
    //   esta no sea valida.
// Nota: se debería crear un sistema de llave publica y privada para evitar
    //   que un usuario use la ss_uuid de otro para acceder a sus datos

import Request from './Request.js';
import Response from './Response.js';

export namespace Session { }

export class Session {
    /**Contiene los datos almacenados en la sesión. */
    private Data: Map<string, any>;
    /**Contiene las instancias de session. */
    private static Sessions: Map<string, Session>;
    /**Contiene la SS_UUID de la sesión. */
    private SessionID: string;
    /**
     * Crea/Recupera una instancia de sesión.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
     * @param Request La petición que recibió el servidor.
	 * @param Response La respuesta que dará el servidor.
    */
    public constructor(Request: Request, Response?: Respuesta);
    /**
     * Devuelve el SS_UUID de la sesión.
    */
   public GetID(): string;
    /**
     * Comprueba si un dato existe en la sesión.
     * @param Name El nombre (key) del dato que desea buscar.
     */
    public Has(Name: string): boolean;
    /**
     * Recupera un dato de la sesión si este existe.
     * @param Name El nombre (key) del dato que desea buscar.
     */
    public Get(Name: string): any | null;
    /**
     * Devuelve un objeto con todos los datos de la session.
     * - Este objeto no esta vinculado, cualquier cambio en el
     *   No se vera reflejado en la sesión.
     */
    public GetAll(): object;
    /**
     * Establece/Reemplaza un dato de la sesión.
     * @param Name El nombre (key) del dato que desea buscar.
     * @param Value El valor que se asignara.
     */
    public Set(Name: string, Value: any): void;
    /**
     * Elimina un dato de la sesión si este existe.
     * @param Name El nombre (key) del dato que desea buscar.
     */
    public Del(Name: string): void;
}

export default Session;