/**
 * @file 
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the mail sender to the server core.
 * @license Apache-2.0
 */

import Debug from '../Debug.js';

import TLS from 'tls';
import NET from 'net';
import FS from 'fs';
import CRYPTO from 'crypto';

export const $Mail = Debug.getInstance('beta.mail', { path: '.debug/beta' });

export class Mail {
    private host: string;
    private port: number;
    private secure: boolean;
    private useStartTLS: boolean;
    private username: string;
    private password: string;
    private email: string;
    /**
     * create a new mail sender
     * @param Options the options to create the mail sender
     */
    public constructor(Options: Mail.CreateOptions) {
        this.host = Options.host;
        this.port = Options.port;
        this.secure = Options.secure ?? false;
        this.useStartTLS = Options.useStartTLS ?? false;
        this.username = Buffer.from(Options.username).toString('base64');
        this.password = Buffer.from(Options.password).toString('base64');
        this.email = Options.email ?? `${Options.username}@${Options.host}`;
    } 
    /**
     * connect to the mail server
     * @returns the socket connection
     * @throws an error if the connection fails
     * @returns a promise that resolves to the socket connection
     * @private
     */
    private async connect(): Promise<NET.Socket|TLS.TLSSocket> {
        try { return await new Promise<NET.Socket | TLS.TLSSocket>((resolve, reject) => {
            const sendSocket = (socket: NET.Socket | TLS.TLSSocket) => {
                const listenData = (data: Buffer) => {
                    const message = data.toString().trim();
                    if (/235.+?Authentication successful$/g.test(message)) {
                        $Mail.log('Authentication successful.');
                        socket.off('error', reject);
                        socket.off('data', listenData);
                        resolve(socket);
                    } else if (/535.+?Error: authentication failed.+?$/g.test(message)) {
                        $Mail.log('Authentication failed.');
                        socket.write('QUIT\r\n');
                        reject(new Error('Authentication error, please check your credentials.'));
                    }
                }
                $Mail.log('Starting authentication.');
                socket.on('data', listenData);
                socket.write(`EHLO ${this.host}\r\n`);
                socket.write(`AUTH LOGIN\r\n`);
                socket.write(`${this.username}\r\n`);
                socket.write(`${this.password}\r\n`);
            }

            if (!this.secure) {
                const socket = NET.connect({ host: this.host, port: this.port }, () => {
                    $Mail.log('Connection established.');
                    sendSocket(socket);
                });
                socket.on('error', reject);
                socket.on('data', (data) => $Mail.log(`[<] ${data.toString().trim()}`));
                socket.on('end', () => $Mail.log('Connection ended'));
            } else if (this.secure && !this.useStartTLS) {
                const secureSocket = TLS.connect({ host: this.host, port: this.port }, () => {
                    $Mail.log('Connection established.');
                    sendSocket(secureSocket);
                });
                secureSocket.on('error', reject);
                secureSocket.on('data', (data) => $Mail.log(`[<] ${data.toString().trim()}`));
                secureSocket.on('end', () => $Mail.log('Connection ended'));
            } else if (this.secure && this.useStartTLS) {
                const socket = NET.connect({ host: this.host, port: this.port }, () => {
                    $Mail.log('Connection established.');
                    $Mail.log('Switching to SSL-TLS.');
                    socket.write('STARTTLS\r\n');
                });
                socket.on('data', (data) => {
                    const message = data.toString().trim();
                    $Mail.log(`[<] ${message}`);
                    if (/^220.+?Ready to start TLS$/g.test(message)) {
                        const secureSocket = TLS.connect({ socket }, () => {
                            $Mail.log('SSL-TLS connection established.');
                            sendSocket(secureSocket);
                        });
                        socket.on('error', reject);
                        secureSocket.on('data', (data) => $Mail.log(`[<] ${data.toString().trim()}`));
                        secureSocket.on('end', () => $Mail.log('Connection ended'));
                    }
                });
                socket.on('error', reject);
                socket.on('end', () => $Mail.log('Connection ended'));
            }
        }); } catch (error) {
            throw new Error(`Failed to connect: ${error instanceof Error ? error.message : error}`);
        }
    }
    /**
     * send a mail
     * @param destination the destination of the mail
     * @param subject the subject of the mail
     * @param content the content of the mail
     * @param options the options of the mail
     * @returns a promise that resolves to true if the mail was sent successfully
     * @throws an error if the mail could not be sent
     */
    public send(destination: string, subject: string, content: string, options: Mail.SendOptions = {}): Promise<boolean>  {
        if (options.files && !Array.isArray(options.files)) throw new Error('`options.files` must be an array.')
        return new Promise((Resolve, Reject) => {
            this.connect().then((socket) => {
                function listenData(data: Buffer) {
                    const message = data.toString().trim();
                    if (/250.+?Ok: queued as./g.test(message)) {
                        $Mail.log('Correo enviado.');
                        socket.off('data', listenData);
                        Resolve(true);
                    } else if (socket.closed) {
                        $Mail.log('Correo no enviado.');
                        Reject('No se pudo enviar el correo.');
                    }
                }
                $Mail.log('Enviando correo.');
                socket.on('data', listenData);

                //Información del correo
                socket.write(`MAIL FROM: <${this.email}>\r\n`);
                socket.write(`RCPT TO: <${destination}>\r\n`);
                socket.write('DATA\r\n');
                socket.write(`Subject: ${subject}\r\n`);
                socket.write(`FROM: ${this.email}\r\n`);
                socket.write(`TO: ${destination}\r\n`);

                if (!options.files || options.files.length < 1) {
                    //Contenido del correo
                    socket.write(`Content-Type: ${
                        options.isHtml ? 'text/html' : 'text/plain'
                    }; charset=utf-8\r\n`)
                    socket.write(`${content}\r\n`);
                } else {
                    let Separador = CRYPTO.randomBytes(32).toString('hex');

                    //Definir que se enviara como multipart
                    socket.write('MIME-Version: 1.0\r\n');
                    socket.write(`Content-Type: multipart/mixed; boundary=${Separador}\n\r`);
                    socket.write('\r\n');

                    //Contenido del correo
                    socket.write(`--${Separador}\r\n`);
                    socket.write(`Content-Type: ${
                        options.isHtml ? 'text/html' : 'text/plain'
                    }; charset=utf-8\r\n`);
                    socket.write('Content-Disposition: inline\r\n');
                    socket.write('\r\n');
                    socket.write(`${content}\r\n`);
                    socket.write('\r\n');
                    /*
                    const files = options.Files ? options.Files.map((File) => {
                        const Content = FS.readFileSync(File.Path);
                        $Mail.log(`Archivo adjunto: ${File.Name}`);
                        return { name: File.Name, content: Content.toString('base64') };
                    }) : [];
                    */
                    //Archivos adjuntos
                    options.files.forEach((file, Pos) => {
                        socket.write(`--${Separador}\r\n`);
                        socket.write(`Content-disposition: attachment; filename=${file.name}\r\n`);
                        socket.write('Content-Transfer-Encoding: base64\r\n');
                        socket.write('Content-Type: application/octet-stream\r\n');
                        socket.write('\r\n');
                        socket.write(`${FS.readFileSync(file.path).toString('base64')}\r\n`);
                        socket.write('\r\n');
                    });
                    socket.write(`--${Separador}--\r\n`);
                }

                //Enviar y finalizar conexión
                socket.write('\r\n.\r\n');
                socket.write('QUIT\r\n');
            }).catch(Reject);
        });
    }
}

export namespace Mail {
    export type CreateOptions = {
        email?: string
        host: string,
        password: string,
        port: number,
        secure?: boolean,
        username: string,
        useStartTLS?: boolean,
    };
    export type File = {
        name: string,
        path: string
    };
    export type SendOptions = {
        isHtml?: boolean,
        files?: File[]
    };
}

export default Mail;