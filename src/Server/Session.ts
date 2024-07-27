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

import CRYPTO from 'crypto';
import EVENTS from 'events';
import Request from './Request.js';
import Cookie from './Cookie.js';

export class Session extends EVENTS {
    /**Contiene las instancias de session. */
    private static Sessions: Map<string, Session> = new Map;
    /**Contiene los datos almacenados en la sesión. */
    private Data: Map<string, any>;
    /**Contiene la SS_UUID de la sesión. */
    private SessionID: string;
    public static getInstance(cookies: Cookie) {
        let sessionID = cookies.get('Session');
        if (!sessionID) {
            sessionID = CRYPTO.randomUUID();
            cookies.set('Session', sessionID, {
                secure: true, httpOnly: true, path: '/', expires: (() => {
                    const Fecha = new Date();
                    Fecha.setFullYear(Fecha.getFullYear() + 1);
                    return Fecha;
                })()
            });
        }
        let session = Session.Sessions.get(sessionID)
        if (!session) {
            session = new Session(sessionID);
            Session.Sessions.set(sessionID, session);
        }
        return session;
    }
    /**
     * Crea/Recupera una instancia de sesión.
     * - si no se pasa el parámetro `Respuesta` No se establecerá la cookie `SS_UUID` y deberás hacerlo manualmente.
     * @param request La petición que recibió el servidor.
     * @param response La respuesta que dará el servidor.
    */
    private constructor(sessionID: string) { super();
        this.Data = new Map();
        this.SessionID = sessionID;
    }
    /**
     * Devuelve el SS_UUID de la sesión.
    */
   public getID(): string { return this.SessionID; }
    /**
     * Comprueba si un dato existe en la sesión.
     * @param name El nombre (key) del dato que desea buscar.
     */
    public has(name: string): boolean { return this.Data.has(name); }
    /**
     * Recupera un dato de la sesión si este existe.
     * @param name El nombre (key) del dato que desea buscar.
     */
    public get(name: string): any | undefined { return this.Data.get(name); }
    /**
     * Devuelve un objeto con todos los datos de la session.
     * - Este objeto no esta vinculado, cualquier cambio en el
     *   No se vera reflejado en la sesión.
     */
    public getAll(): Session.SessionObject { 
        const Data: Session.SessionObject = {};
        this.Data.forEach((Value, Key) => Data[Key] = Value);
        return Data;
     }
    /**
     * Establece/Reemplaza un dato de la sesión.
     * @param name El nombre (key) del dato que desea buscar.
     * @param value El valor que se asignara.
     */
    public set(name: string, value: any): void { this.Data.set(name, value); }
    /**
     * Elimina un dato de la sesión si este existe.
     * @param name El nombre (key) del dato que desea buscar.
     */
    public delete(name: string): void { this.Data.delete(name); }
}

export namespace Session {
    export interface SessionObject {
        [key: string]: any
    }
}

export default Session;