/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 */

import CRYPTO from 'crypto';
import EVENTS from 'events';

class WebSocket extends EVENTS {
    /**@type {import('stream').Duplex} Contiene la conexión con el cliente. */
    Conexión = null;
    /**@type {string} Contiene la SS_UUID de la sesión asociada al WebSocket. */
    SS_UUID = null;
    /**
     * Crea una conexión WebSocket.
     * @param {import('stream').Duplex} Cliente La conexión Duplex con el cliente.
     */
    constructor(Cliente) { super();
        this.Conexión = Cliente;
        this.Iniciar_Eventos();
    }
    /**
     * Acepta la conexión del cliente.
	 * @param {string} Llave La llave de conexión `sec-websocket-key`.
     * @returns {void}
     */
    Aceptar_Conexión(Llave) {
        let Clave = CRYPTO.createHash('SHA1').update(
            Llave + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        ).digest('base64');
        this.Conexión.write(''
            + 'HTTP/1.1 101 Switching Protocols\r\n'
            + 'Upgrade: websocket\r\n'
            + 'Connection: Upgrade\r\n'
            + `Sec-WebSocket-Accept: ${Clave}\r\n`
            + (this.SS_UUID
            ? `Set-Cookie: SS_UUID=${this.SS_UUID}; path=/; secure; httpOnly;\r\n`
            : '')
            + '\r\n'
        );
    }
    /**
     * Codifica los datos para enviar por el WebSocket.
     * @param {Buffer} Datos Los datos que se van a codificar.
     * @param {boolean} Texto indica si el contenido es texto o no.
     * @returns {Buffer}
     */
    Codificar (Datos, Texto = false) {
        let Codificado = Texto ? [129] : [130];
        if (Datos.length <= 125) {
            Codificado[1] = Datos.length;
        } else if (Datos.length >= 126 && Datos.length <= 65535) {
            Codificado[1] = 126;
            Codificado[2] = (Datos.length >> 8) & 255;
            Codificado[3] = (Datos.length) & 255
        } else {
            Codificado[1] = 127;
            Codificado[2] = (Datos.length >> 56) & 255;
            Codificado[3] = (Datos.length >> 48) & 255;
            Codificado[4] = (Datos.length >> 40) & 255;
            Codificado[5] = (Datos.length >> 32) & 255;
            Codificado[6] = (Datos.length >> 24) & 255;
            Codificado[7] = (Datos.length >> 16) & 255;
            Codificado[8] = (Datos.length >>  8) & 255;
            Codificado[9] = (Datos.length) & 255;
        }
        for (let Posición = 0; Posición < Datos.length; Posición ++) {
            Codificado.push(Datos[Posición]);
        }
        return Buffer.from(Codificado);
    }
    /**
	 * Envía un dato como respuesta.
	 * @param {string|Buffer} Dato El dato que se enviara.
     * @returns {void}
     */
    Enviar(Dato) {
        let [Buffer, Tipo] = typeof Dato == 'string'
        ? [this.String_Buffer(Dato), true]
        : typeof Dato == 'object'
            ? [Dato, false]
            : [this.String_Buffer('[Error]: Dato enviado no soportado por Saml/WebSocket'), true];
        let Mensaje = this.Codificar(Buffer, Tipo);
        this.Conexión.write(Mensaje);
    }
    /**
	 * Envía un JSON como respuesta.
	 * @param {Array<any>|Object<string, any>} Datos los datos que enviaras como JSON.
     * @returns {void}
     */
    Enviar_JSON(Datos) {
        let Mensaje = JSON.stringify(Datos);
        this.Enviar(Mensaje);
    }
    /**
     * Convierte un string en un Buffer.
     * @param {string} Mensaje El string a transformar.
     * @returns {Buffer}
     */
    String_Buffer(Mensaje) {
        /** Forma anterior, reemplazada el 10/08/2023 7:15am
        let Códigos = [];
        Mensaje = encodeURI(Mensaje);
        for (let Posición = 0; Posición < Mensaje.length; Posición++) {
            Códigos.push(Mensaje.charCodeAt(Posición));
        }
        return Buffer.from(Códigos);
        **/
        return Buffer.from(Mensaje, 'utf-8');
    }
    
    /**
     * Añade los disparadores de evento.
     * @private
     * @returns {void}
     */
    Iniciar_Eventos() {
        /**@type {boolean} */
        let Esperando = false;
        /**@type {Buffer} */
        let Residuo = null;
        /**@type {boolean} */
        let Fin = null;
        /**@type {number} */
        let Rsv = null;
        /**@type {number} */
        let OPCode = null;
        /**@type {boolean} */
        let Mask = null;
        /** @type {number|bigint} */
        let Tamaño = null;
        /**@type {Buffer} */
        let Mask_Keys = null;
        /**@type {number} */
        let Bytes_Info = null;
        /**@type {Buffer} */
        let Parte = null;
        /**@type {Buffer[]} */
        let Partes = [];
        /**@type {number} */
        let Tipo = null;
        this.Conexión.on('data', /**@param {Buffer} Datos */ (Datos) => {
            if (Residuo) Datos = Buffer.concat([Residuo, Datos]), Residuo = null;
            if (!Esperando) {
                Fin =    Boolean(((Datos[0] >>> 0x7) & 0x01));
                Rsv =            ((Datos[0] >>> 0x4) & 0x07);
                OPCode =         ( Datos[0]          & 0x0f);
                Mask =   Boolean(((Datos[1] >>> 0x7) & 0x01));
                Tamaño =         ( Datos[1]          & 0x7f);
                [Tamaño, Mask_Keys, Bytes_Info] = Tamaño == 0x7f
                ? [
                    Datos.readBigUint64BE(2),
                    Mask ? Datos.slice(10, 14) : null,
                    Mask ? 14 : 10,
                ] : Tamaño == 0x7e
                    ? [
                        Datos.readUint16BE(2),
                        Mask ? Datos.slice(4, 8) :  null,
                        Mask ? 8 : 4,
                    ]
                    : [
                        Tamaño,
                        Mask ? Datos.slice(2, 6) :  null,
                        Mask ? 6 : 2,
                    ];
                Parte = Datos;
                Tipo = OPCode > 0x0 ? OPCode : Tipo;
            } else {
                Parte = Buffer.concat([Parte, Datos])
            }
            //WSD.Log('Fin:', Fin, 'Rsv', Rsv, 'OPCode', OPCode, 'Tamaño', Tamaño.toString(), 'Tamaño Buffer', Chunk.length);
            if (Parte.length < (BigInt(Tamaño) + BigInt(Bytes_Info))) {
                Esperando = true;
            } else {
                if (Parte.length > (BigInt(Tamaño) + BigInt(Bytes_Info))) {
                    Residuo = Parte.slice(Number(BigInt(Tamaño) + BigInt(Bytes_Info)));
                    Parte = Parte.slice(0, Number(BigInt(Tamaño) + BigInt(Bytes_Info)));
                }
                let Decodificado = [];
                let Posición = Bytes_Info;
                let Posición_Mask = 0;
                while(Posición < Parte.length) {
                    Decodificado.push(Parte[Posición] ^ Mask_Keys[Posición_Mask%4]);
                    Posición++, Posición_Mask++;
                }
                Partes.push(Buffer.from(Decodificado));
                if (Fin) {
                    let Mensaje = Buffer.concat(Partes);
                    //Mensaje Decodificado
                    /**
                     * Se emitirá cuando se termine de recibir y decodificar un mensaje
                     * @event Recibir
                     */
                    this.emit('Recibir',{
                        OPCode: Tipo
                    }, Mensaje);
                    Partes = [];
                }
                Esperando = false;
                Fin = null;
                Rsv = null;
                OPCode = null;
                Mask = null;
                Tamaño = null;
                Mask_Keys = null;
                Bytes_Info = null;
                Parte = null;
            }
        });
        this.Conexión.on('close', /**@event Cerrar */    () => this.emit('Cerrar'));
        this.Conexión.on('end',   /**@event Finalizar */ () => this.emit('Finalizar'));
        this.Conexión.on('error', /**@event Error */     (Error) => this.emit('Error', Error));
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