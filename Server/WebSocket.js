/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';
import EVENTS from 'events';

class WebSocket extends EVENTS {
    /**@type {import('stream').Duplex} Contiene la conexión con el cliente. */
    Connection = null;
    /**@type {string} Contiene la SS_UUID de la sesión asociada al WebSocket. */
    SessionID = null;
    /**
     * Crea una conexión WebSocket.
     * @param {import('stream').Duplex} Client La conexión Duplex con el cliente.
     */
    constructor(Client) { super();
        this.Connection = Client;
        this.StartEvents();
    }
    /**
     * Acepta la conexión del cliente.
	 * @param {string} AcceptKey La llave de conexión `sec-websocket-key`.
     * @returns {void}
     */
    AcceptConnection(AcceptKey) {
        let Pass = CRYPTO.createHash('SHA1').update(
            AcceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        ).digest('base64');
        this.Connection.write(''
            + 'HTTP/1.1 101 Switching Protocols\r\n'
            + 'Upgrade: websocket\r\n'
            + 'Connection: Upgrade\r\n'
            + `Sec-WebSocket-Accept: ${Pass}\r\n`
            + (this.SessionID
            ? `Set-Cookie: SS_UUID=${this.SessionID}; secure; httpOnly;\r\n`
            : '')
            + '\r\n'
        );
    }
    /** Finaliza la conexión esperando a que se terminen de enviar/recibir los datos pendientes. */
    End() { this.Connection.end(); }
    /** Finaliza la conexión de forma abrupta. */
    Destroy() { this.Connection.destroy(); }
    /**
     * Codifica los datos para enviar por el WebSocket.
     * @param {Buffer} Data Los datos que se van a codificar.
     * @param {boolean} IsText indica si el contenido es texto o no.
     * @returns {Buffer}
     */
    Encode(Data, IsText = false) {
        let Encoded = IsText ? [129] : [130];
        if (Data.length <= 125) {
            Encoded[1] = Data.length;
        } else if (Data.length >= 126 && Data.length <= 65535) {
            Encoded[1] = 126;
            Encoded[2] = (Data.length >> 8) & 255;
            Encoded[3] = (Data.length) & 255
        } else {
            Encoded[1] = 127;
            Encoded[2] = (Data.length >> 56) & 255;
            Encoded[3] = (Data.length >> 48) & 255;
            Encoded[4] = (Data.length >> 40) & 255;
            Encoded[5] = (Data.length >> 32) & 255;
            Encoded[6] = (Data.length >> 24) & 255;
            Encoded[7] = (Data.length >> 16) & 255;
            Encoded[8] = (Data.length >>  8) & 255;
            Encoded[9] = (Data.length) & 255;
        }
        for (let Position = 0; Position < Data.length; Position ++) {
            Encoded.push(Data[Position]);
        }
        return Buffer.from(Encoded);
    }
    /**
	 * Envía un dato como respuesta.
	 * @param {string|Buffer} Datum El dato que se enviara.
     * @returns {void}
     */
    Send(Datum) {
        let [Buffer, IsText] = typeof Datum == 'string'
        ? [this.StringToBuffer(Datum), true]
        : typeof Datum == 'object'
            ? [Datum, false]
            : [this.StringToBuffer('[Error]: Dato enviado no soportado por Saml/WebSocket'), true];
        let Message = this.Encode(Buffer, IsText);
        this.Connection.write(Message);
    }
    /**
	 * Envía un JSON como respuesta.
	 * @param {Array<any>|Object<string, any>} Data los datos que enviaras como JSON.
     * @returns {void}
     */
    SendJSON(Data) {
        let Message = JSON.stringify(Data);
        this.Send(Message);
    }
    /**
     * Convierte un string en un Buffer.
     * @param {string} Message El string a transformar.
     * @returns {Buffer}
     */
    StringToBuffer(Message) {
        return Buffer.from(Message, 'utf-8');
    }
    
    /**
     * Añade los disparadores de evento.
     * @private
     * @returns {void}
     */
    StartEvents() {
        /**@type {boolean} */
        let Waiting = false;
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
        let Size = null;
        /**@type {Buffer} */
        let Mask_Keys = null;
        /**@type {number} */
        let Bytes_Info = null;
        /**@type {Buffer} */
        let Part = null;
        /**@type {Buffer[]} */
        let Parts = [];
        /**@type {number} */
        let Type = null;
        this.Connection.on('data', /**@param {Buffer} Data */ (Data) => {
            if (Residuo) Data = Buffer.concat([Residuo, Data]), Residuo = null;
            if (!Waiting) {
                Fin =    Boolean(((Data[0] >>> 0x7) & 0x01));
                Rsv =            ((Data[0] >>> 0x4) & 0x07);
                OPCode =         ( Data[0]          & 0x0f);
                Mask =   Boolean(((Data[1] >>> 0x7) & 0x01));
                Size =           ( Data[1]          & 0x7f);
                [Size, Mask_Keys, Bytes_Info] = Size == 0x7f
                ? [
                    Data.readBigUint64BE(2),
                    Mask ? Data.slice(10, 14) : null,
                    Mask ? 14 : 10,
                ] : Size == 0x7e
                    ? [
                        Data.readUint16BE(2),
                        Mask ? Data.slice(4, 8) :  null,
                        Mask ? 8 : 4,
                    ]
                    : [
                        Size,
                        Mask ? Data.slice(2, 6) :  null,
                        Mask ? 6 : 2,
                    ];
                Part = Data;
                Type = OPCode > 0x0 ? OPCode : Type;
            } else {
                Part = Buffer.concat([Part, Data])
            }
            //WSD.Log('Fin:', Fin, 'Rsv', Rsv, 'OPCode', OPCode, 'Tamaño', Tamaño.toString(), 'Tamaño Buffer', Chunk.length);
            if (Part.length < (BigInt(Size) + BigInt(Bytes_Info))) {
                Waiting = true;
            } else {
                if (Part.length > (BigInt(Size) + BigInt(Bytes_Info))) {
                    Residuo = Part.slice(Number(BigInt(Size) + BigInt(Bytes_Info)));
                    Part = Part.slice(0, Number(BigInt(Size) + BigInt(Bytes_Info)));
                }
                let Decoded = [];
                let Position = Bytes_Info;
                let Position_Mask = 0;
                while(Position < Part.length) {
                    Decoded.push(Part[Position] ^ Mask_Keys[Position_Mask%4]);
                    Position++, Position_Mask++;
                }
                Parts.push(Buffer.from(Decoded));
                if (Fin) {
                    let Message = Buffer.concat(Parts);
                    //Mensaje Decodificado
                    /**
                     * Se emitirá cuando se termine de recibir y decodificar un mensaje
                     * @event Message
                     */
                    this.emit('Message',{
                        OPCode: Type
                    }, Message);
                    Parts = [];
                }
                Waiting = false;
                Fin = null;
                Rsv = null;
                OPCode = null;
                Mask = null;
                Size = null;
                Mask_Keys = null;
                Bytes_Info = null;
                Part = null;
            }
        });
        this.Connection.on('close', /**@event Cerrar */    ()      => this.emit('Close'));
        this.Connection.on('end',   /**@event Finalizar */ ()      => this.emit('Finish'));
        this.Connection.on('error', /**@event Error */     (Error) => this.emit('Error', Error));
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