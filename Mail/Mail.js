/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Permite la emisión de correos electrónicos.
 * @license Apache-2.0
 */

import Debug from '../Debug/Debug.js';

import TLS from 'tls';
import NET from 'net';
import FS from 'fs';
import CRYPTO from 'crypto';

const $Mail = new Debug('Mail', '.Debug/Mail');

class Mail {
    /** @type {string} */
    Host = null;
    /** @type {number} */
    Port = null;
    /** @type {boolean} */
    Secure = null;
    /** @type {boolean} */
    UseStartTLS = null;
    /** @type {string} */
    UserName = null;
    /** @type {string} */
    Password = null;
    /** @type {string} */
    Email = null;
    /**
     * Crea una instancia de MailSender.
     * @param { import('./Mail.js').default.CreateOptions } Options Las opciones para la conexión.
     */
    constructor(Options) {
        this.Host = Options.Host;
        this.Port = Options.Port;
        this.Secure = Options.Secure ?? false;
        this.UseStartTLS = Options.UseStartTLS ?? false;
        this.UserName = Buffer.from(Options.UserName).toString('base64');
        this.Password = Buffer.from(Options.Password).toString('base64');
        this.Email = Options.Email ?? `${Options.UserName}@${Options.Host}`;
    }
    /**
     * Crea una conexión con el servidor SMTP.
     * @returns {Promise<NET.Socket|TLS.TLSSocket>}
     */
    Connect() {
        return new Promise((Resolve, Reject) => {
            /**
             * Devuelve un error como respuesta a la promesa.
             * @param {any} Error El error producido
             */
            function SendError(Error) {
                Reject(Error)
            }
            /**
             *  Inicia sesión y devuelve el Socket como respuesta y elimina los eventos de Reject.
             * @param {NET.Socket|TLS.TLSSocket} Socket 
             */
            const SendSocket = (Socket) => {
                /** @param {Buffer} Data */
                const ListenData = (Data) => {
                    let Message = Data.toString().trim();
                    if (/235.+?Authentication successful$/g.test(Message)) {
                        $Mail.Log('Autenticación exitosa.');
                        Socket.off('error', SendError);
                        Socket.off('data', ListenData);
                        Resolve(Socket);
                    } else if (/535.+?Error: authentication failed.+?$/g.test(Message)) {
                        $Mail.Log('Autenticación fallida.');
                        Socket.write('QUIT\r\n');
                        Reject('Error de autenticación, verifique sus credenciales.');
                    }
                }
                $Mail.Log('Iniciando autenticación.');
                Socket.on('data', ListenData);
                Socket.write(`EHLO ${this.Host}\r\n`);
                Socket.write(`AUTH LOGIN\r\n`);
                Socket.write(`${this.UserName}\r\n`);
                Socket.write(`${this.Password}\r\n`);
            }
            if (! this.Secure) {
                let Socket = NET.connect({ host: this.Host, port: this.Port }, () => {
                    $Mail.Log('Conexión establecida.');
                    SendSocket(Socket);
                });
                Socket.on('error', SendError);
                Socket.on('data',  (Data)  => $Mail.Log(`[<] ${Data.toString().trim()}`));
                Socket.on('error', (Error) => $Mail.Log(`[<] ${Error.toString().trim()}`));
                Socket.on('end',   ()      => $Mail.Log('Conexión finalizada'));
            } else if (this.Secure && ! this.UseStartTLS) {
                let SecureSocket = TLS.connect({ host: this.Host, port: this.Port }, () => {
                    $Mail.Log('Conexión establecida.');
                    SendSocket(SecureSocket);
                });
                SecureSocket.on('error', SendError);
                SecureSocket.on('data',  (Data)  => $Mail.Log(`[<] ${Data.toString().trim()}`));
                SecureSocket.on('error', (Error) => $Mail.Log(`[<] ${Error.toString().trim()}`));
                SecureSocket.on('end',   ()      => $Mail.Log('Conexión finalizada'));
            } else if (this.Secure && this.UseStartTLS) {
                let Socket = NET.connect({ host: this.Host, port: this.Port }, () => {
                    $Mail.Log('Conexión establecida.');
                    $Mail.Log('Cambiando a SSL-TLS.');
                    Socket.write('STARTTLS\r\n');
                });
                Socket.on('data',  (Data)  => {
                    let Message = Data.toString().trim();
                    $Mail.Log(`[<] ${Message}`);
                    if (/^220.+?Ready to start TLS$/g.test(Message)) {
                        let SecureSocket = TLS.connect({ socket: Socket }, () => {
                            $Mail.Log('Conexión SSL-TLS establecida.');
                            SendSocket(SecureSocket);
                        });
                        Socket.on('error', SendError);
                        SecureSocket.on('data',  (Data)  => $Mail.Log(`[<] ${Data.toString().trim()}`));
                        SecureSocket.on('error', (Error) => $Mail.Log(`[<] ${Error.toString().trim()}`));
                        SecureSocket.on('end',   ()      => $Mail.Log('Conexión finalizada'));
                    }
                });
                Socket.on('error', SendError);
                Socket.on('error', (Error) => $Mail.Log(`[<] ${Error.toString().trim()}`));
                Socket.on('end',   ()      => $Mail.Log('Conexión finalizada'));
            }
        });
    }
    /**
     * 
     * @param {string} Destination El correo destino.
     * @param {string} Subject El asunto del correo.
     * @param {string} Content El contenido del correo.
     * @param {import('./Mail.js').default.SendOptions} Options Indica si el contenido es HTML.
     */
    SendMail(Destination, Subject, Content, Options = {}) {
        Options.IsHtml = Options.IsHtml ?? false;
        Options.Files  = Options.Files  ?? [];
        /** @type {Array<string>} */
        let Files = [];
        if (Options.Files.length > 0) {
            Options.Files.forEach((File, I) => {
                Debug.Log('nuevo archivo cargado');
                Files[I] = FS.readFileSync(File.Path).toString('base64');
            });
        }
        return new Promise((Resolve, Reject) => {
            this.Connect().then((Socket) => {
                /** @param {Buffer} Data */
                const ListenData = (Data) => {
                    let Message = Data.toString().trim();
                    if (/250.+?Ok: queued as./g.test(Message)) {
                        $Mail.Log('Correo enviado.');
                        Socket.off('data', ListenData);
                        Resolve('Correo enviado.');
                    } else if (Socket.closed) {
                        $Mail.Log('Correo no enviado.');
                        Reject('No se pudo enviar el correo.');
                    }
                }
                $Mail.Log('Enviando correo.');
                Socket.on('data', ListenData);

                //Información del correo
                Socket.write(`MAIL FROM: <${this.Email}>\r\n`);
                Socket.write(`RCPT TO: <${Destination}>\r\n`);
                Socket.write('DATA\r\n');
                Socket.write(`Subject: ${Subject}\r\n`);
                Socket.write(`FROM: ${this.Email}\r\n`);
                Socket.write(`TO: ${Destination}\r\n`);

                if (Options.Files.length < 1) {
                    //Contenido del correo
                    Socket.write(`Content-Type: ${
                        Options.IsHtml ? 'text/html' : 'text/plain'
                    }; charset=utf-8\r\n`)
                    Socket.write(`${Content}\r\n`);
                } else {
                    let Separador = CRYPTO.randomBytes(32).toString('hex');

                    //Definir que se enviara como multipart
                    Socket.write('MIME-Version: 1.0\r\n');
                    Socket.write(`Content-Type: multipart/mixed; boundary=${Separador}\n\r`);
                    Socket.write('\r\n');

                    //Contenido del correo
                    Socket.write(`--${Separador}\r\n`);
                    Socket.write(`Content-Type: ${
                        Options.IsHtml ? 'text/html' : 'text/plain'
                    }; charset=utf-8\r\n`);
                    Socket.write('Content-Disposition: inline\r\n');
                    Socket.write('\r\n');
                    Socket.write(`${Content}\r\n`);
                    Socket.write('\r\n');

                    //Archivos adjuntos
                    Files.forEach((File, Pos) => {
                        Socket.write(`--${Separador}\r\n`);
                        Socket.write(`Content-disposition: attachment; filename=${Options.Files[Pos].Name}\r\n`);
                        Socket.write('Content-Transfer-Encoding: base64\r\n');
                        Socket.write('Content-Type: application/octet-stream\r\n');
                        Socket.write('\r\n');
                        Socket.write(`${File}\r\n`);
                        Socket.write('\r\n');
                    });
                    Socket.write(`--${Separador}--\r\n`);
                }

                //Enviar y finalizar conexión
                Socket.write('\r\n.\r\n');
                Socket.write('QUIT\r\n');
            }).catch(Reject);
        });
    }
}

export default Mail;