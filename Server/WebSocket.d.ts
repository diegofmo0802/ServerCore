/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 * @license Apache-2.0
 */

import EVENTS from 'events';
import {Duplex} from 'stream';

export namespace WebSocket { }

export class WebSocket /* extends EVENTS */ {
    /**Contiene la conexión con el cliente. */
    private Connection: Duplex;
    /**Contiene la SS_UUID de la sesión asociada al WebSocket. */
    public SessionID: string;
    /**
     * Crea una conexión WebSocket.
     * @param Client La conexión Duplex con el cliente.
     */
    public constructor(Client: Duplex);
    /**
     * Acepta la conexión del cliente.
	 * @param AcceptKey La llave de conexión `sec-websocket-key`.
     */
    public AcceptConnection(AcceptKey: string): void;
    /** Finaliza la conexión esperando a que se terminen de enviar/recibir los datos pendientes. */
    End(): void;
    /** Finaliza la conexión de forma abrupta. */
    Destroy(): void;
    /**
	 * Envía un dato como respuesta.
	 * @param Datum El dato que se enviara.
     */
    public Send(Datum: String | Buffer): void;
    /**
	 * Envía un JSON como respuesta.
	 * @param Data los datos que enviaras como JSON.
     */
    public SendJSON(Data: Array<any> | Object): void;
    /**
     * Codifica los datos para enviar por el WebSocket.
     * @param Data Los datos que se van a codificar.
     * @param Text indica si el contenido es texto o no.
     * @returns {Buffer}
     */
    private Encode(Data: Buffer, Text: boolean): Buffer;
    /**
     * Convierte un string en un Buffer.
     * @param Message El string a transformar.
     * @returns {Buffer}
     */
    private StringToBuffer(Message: string): Buffer;
    /**Añade los disparadores de evento.*/
    private StartEvents(): void;
    on(Evento: 'Close',    Acción: () => void): this;
    on(Evento: 'Error',    Acción: (Error: Error) => void): this;
    on(Evento: 'Finish',   Acción: () => void): this;
    on(Evento: 'Message',  Acción: (Information: {OPCode: number}, Datos: Buffer) => void): this;
    off(Evento: 'Close',   Acción: () => void): this;
    off(Evento: 'Error',   Acción: (Error: Error) => void): this;
    off(Evento: 'Finish',  Acción: () => void): this;
    off(Evento: 'Message', Acción: (Information: {OPCode: number}, Datos: Buffer) => void): this;
}
export default WebSocket;