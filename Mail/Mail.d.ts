/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Permite la emisión de correos electrónicos.
 * @license Apache-2.0
 */

import TLS from 'tls';
import NET from 'net';

declare namespace Mail {
    type CreateOptions = {
        Email?: string
        Host: string,
        Password: string,
        Port: number,
        Secure?: boolean,
        UserName: string,
        UseStartTLS?: boolean,
    };
    type File = {
        Name: string,
        Path: string
    };
    type SendOptions = {
        IsHtml?: boolean,
        Files?: Array<File>
    };
}

declare class Mail {
    private Host: String;
    private Port: Number;
    private Secure: boolean;
    private UseStartTLS: boolean;
    private UserName: string;
    private Password: string;
    private Email: string;
    /**
     * Crea una instancia de MailSender.
     * @param Options Las opciones para la conexión.
     */
    public constructor(Options: Mail.CreateOptions): Mail
    /**
     * Crea una conexión con el servidor SMTP.
     * @returns {}
     */
    private Connect(): Promise<NET.Socket|TLS.TLSSocket>
    /**
     * 
     * @param Destination El correo destino.
     * @param Subject El asunto del correo.
     * @param Content El contenido del correo.
     * @param Options Indica si el contenido es HTML.
     */
    public SendMail(Destination: string, Subject: string, Content: string, Options: Mail.SendOptions): Promise<boolean>
}

export default Mail;