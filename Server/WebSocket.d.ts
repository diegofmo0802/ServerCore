/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 */

import EVENTS from 'events';
import {Duplex} from 'stream';

export class WebSocket extends EVENTS {
    /**Contiene la conexión con el cliente. */
    private Conexión: Duplex;
    /**Contiene la SS_UUID de la sesión asociada al WebSocket. */
    public SS_UUID: string;
    /**
     * Crea una conexión WebSocket.
     * @param Cliente La conexión Duplex con el cliente.
     */
    public constructor(Cliente: Duplex);
    /**
     * Acepta la conexión del cliente.
	 * @param Llave La llave de conexión `sec-websocket-key`.
     */
    public Aceptar_Conexión(Llave: string): void;
    /**
	 * Envía un dato como respuesta.
	 * @param Dato El dato que se enviara.
     */
    public Enviar(Dato: String | Buffer): void;
    /**
	 * Envía un JSON como respuesta.
	 * @param Datos los datos que enviaras como JSON.
     */
    public EnviarJson(Datos: Array<any> | Object): void;
    /**
     * Codifica los datos para enviar por el WebSocket.
     * @param Datos Los datos que se van a codificar.
     * @param Texto indica si el contenido es texto o no.
     * @returns {Buffer}
     */
    private Codificar (Datos: Buffer, Texto: boolean): Buffer;
    /**
     * Convierte un string en un Buffer.
     * @param Mensaje El string a transformar.
     * @returns {Buffer}
     */
    private String_Buffer(Mensaje: string): Buffer;
    /**Añade los disparadores de evento.*/
    private Iniciar_Eventos(): void;
    on(Evento: 'Cerrar',    Acción: () => void): this;
    on(Evento: 'Error',     Acción: (Error: Error) => void): this;
    on(Evento: 'Finalizar', Acción: () => void): this;
    on(Evento: 'Recibir',   Acción: (Información: {OPCode: number}, Datos: Buffer) => void): this;
}
export default WebSocket;