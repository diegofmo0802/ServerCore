/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 * @license Apache-2.0
 */

import EVENTS from 'events';
import CRYPTO from 'crypto';
import { Duplex } from 'stream';
import Chunk from './Chunk.js';
import { setUncaughtExceptionCaptureCallback } from 'process';
import Cookie from '../Cookie.js';

export class WebSocket extends EVENTS {
    /**Contiene la conexión con el cliente. */
    private connection: Duplex;
    /**
     * Crea una conexión WebSocket.
     * @param client La conexión Duplex con el cliente.
     */
    public constructor(client: Duplex) { super();
        this.connection = client;
        this.initEvents();
    }
    /**
     * Acepta la conexión del cliente.
	 * @param acceptKey La llave de conexión `sec-websocket-key`.
     */
    public acceptConnection(acceptKey: string, cookies?: Cookie): void  {
        const cookieSetters = cookies
        ? cookies.getSetters().map((setter) => `Set-Cookie: ${setter}`)
        : [];
        const acceptToken = CRYPTO.createHash('SHA1').update(
            acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        ).digest('base64');
        const headers = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptToken}`,
            ...cookieSetters, '\r\n'
        ].join('\r\n');
        this.connection.write(headers);
    }
    /** Finaliza la conexión esperando a que se terminen de enviar/recibir los datos pendientes. */
    public end(): void { this.connection.end(); }
    /** Finaliza la conexión de forma abrupta. */
    public destroy(): void { this.connection.destroy(); }
    /**
	 * Envía un dato como respuesta.
	 * @param data El dato que se enviara.
     */
    public send(data: String | Buffer): void {
        const [buffer, isText] = typeof data == 'string'
        ? [this.stringToBuffer(data), true]
        : data instanceof Buffer
            ? [data, false]
            : [this.stringToBuffer('[Error]: Dato enviado no soportado por Saml/WebSocket'), true];
        const message = this.encode(buffer, isText);
        this.connection.write(message);
    }
    /**
	 * Envía un JSON como respuesta.
	 * @param data los datos que enviaras como JSON.
     */
    public SendJson(data: any): void {
        const message = JSON.stringify(data);
        this.send(message);
    }
    /**
     * Codifica los datos para enviar por el WebSocket.
     * @param data Los datos que se van a codificar.
     * @param Text indica si el contenido es texto o no.
     */
    private encode(data: Buffer, isText: boolean = false): Buffer {
        const encoded = isText ? [129] : [130];
        if (data.length <= 125) {
            encoded[1] = data.length;
        } else if (data.length >= 126 && data.length <= 65535) {
            encoded[1] = 126;
            encoded[2] = (data.length >> 8) & 255;
            encoded[3] = (data.length)      & 255
        } else {
            encoded[1] = 127;
            encoded[2] = (data.length >> 56) & 255;
            encoded[3] = (data.length >> 48) & 255;
            encoded[4] = (data.length >> 40) & 255;
            encoded[5] = (data.length >> 32) & 255;
            encoded[6] = (data.length >> 24) & 255;
            encoded[7] = (data.length >> 16) & 255;
            encoded[8] = (data.length >>  8) & 255;
            encoded[9] = (data.length)       & 255;
        }
        /* for (let index = 0; index < data.length; index ++) {
            encoded.push(data[index]);
        } */
        encoded.push(...data);
        return Buffer.from(encoded);
    }
    /**
     * Convierte un string en un Buffer.
     * @param message El string a transformar.
     */
    private stringToBuffer(message: string): Buffer {
        return Buffer.from(message, 'utf-8');
    }
    /**Añade los disparadores de evento.*/
    private initEvents(): void {
        let surplus: Buffer = Buffer.alloc(0);
        let currentChunk: Chunk | null = null;
        let chunks: Chunk[] = [];

        this.connection.on('data', (data: Buffer) => {
            if (surplus) {
                data = Buffer.concat([surplus, data]);
                surplus = Buffer.alloc(0);
            }
            if (!currentChunk) currentChunk = new Chunk(data);
            else if (currentChunk.isWaiting()) currentChunk.pushData(data);
            if (!currentChunk.isWaiting()) {
                chunks.push(currentChunk);
                surplus = currentChunk.surplus;
                if (currentChunk.fin) {
                    const decoded = Buffer.concat(chunks.map(chunk => chunk.decode()));
                    this.emit('message', decoded, {
                        opCode: chunks[0].opCode,
                        size: chunks[0].size
                    });
                    chunks = [];
                }
                currentChunk = null;
            }
        });
        this.connection.on('close', ()      => this.emit('close'));
        this.connection.on('end',   ()      => this.emit('finish'));
        this.connection.on('error', (error) => this.emit('error', error));
    }

    public on(event: 'close',    listener: WebSocket.listener.close): this;
    public on(event: 'error',    listener: WebSocket.listener.error): this;
    public on(event: 'finish',   listener: WebSocket.listener.finish): this;
    public on(event: 'message',  listener: WebSocket.listener.message): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
    public off(event: 'close',   listener: WebSocket.listener.close): this;
    public off(event: 'error',   listener: WebSocket.listener.error): this;
    public off(event: 'finish',  listener: WebSocket.listener.finish): this;
    public off(event: 'message', listener: WebSocket.listener.message): this
    public off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }
}

export namespace WebSocket {
    export namespace listener {
        export type close = () => void;
        export type error = (error: Error) => void;
        export type finish = () => void;
        export type message = (datos: Buffer, info: dataInfo) => void;
    }
    export interface dataInfo {
        opCode: number;
        size: number | bigint;
    }
}

export default WebSocket;

/* Para aceptar las peticiones de conexión a WebSocket
 * 
 * HTTP/1.1 101 Switching Protocols
 * Upgrade: websocket
 * Connection: Upgrade
 * Sec-WebSocket-Accept: Sec-Websocket-key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
 *                                            en HASH SHA-1 Codificado en Base64
 *
 ** Formato del intercambio de datos
 *  0               1               2               3              
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-------+-+-------------+-------------------------------+
 * |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 * |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 * |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 * | |1|2|3|       |K|             |                               |
 * +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 * |     Extended payload length continued, if payload len == 127  |
 * + - - - - - - - - - - - - - - - +-------------------------------+
 * |                               |Masking-key, if MASK set to 1  |
 * +-------------------------------+-------------------------------+
 * | Masking-key (continued)       |          Payload Data         |
 * +-------------------------------- - - - - - - - - - - - - - - - +
 * :                     Payload Data continued ...                :
 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 * |                     Payload Data continued ...                |
 * +---------------------------------------------------------------+
 * 
 * 
 * FIN y OPCODE funcionan juntos para entregar mensajes con marco separado
 * Solo esta disponible en OPCODE 0x0 a 0x2
 * 
 * OPCODES:
 * Continuación = 0x0
 * Texto = 0x1
 * Binario = 0x2
 * Cierre = 0x8
 * Ping = 0x9
 * Pong = 0xa
 */