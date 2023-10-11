/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene las funcionalidades base de las herramientas del modulo saml
 * @license Saml
 * @module Saml/CUI
 */

export default class CUI {
    /**
     * Hace una pregunta al usuario.
     * @param {string} Pregunta La pregunta que se le hará al usuario.
     * @returns {Promise<string>}
     */
    static Preguntar(Pregunta) {
        return new Promise((Respuesta, Error) => {
            /**
             * Da respuesta a la promesa enviada.
             * @param {Buffer} Mensaje la respuesta del usuario.
             */
            function Responder(Mensaje) {
                Mensaje = Mensaje.toString().replace(/[\n\r]+/g, '');
                Respuesta(Mensaje);
                process.stdin.removeListener('data', Responder);
            }
            process.stdout.write(`${Pregunta} `, 'utf8');
            process.stdin.addListener('data', Responder);
        });
    }
    /**
     * Envía un mensaje al usuario a traves de la consola.
     * @param {string|String[]} Mensaje El/Los mensaje/s que deseas enviar al usuario.
     * @param {boolean} Salto Si hay o no un salto de linea
     */
    static Enviar(Mensaje, Salto = true) {
        if (typeof Mensaje === 'string') {
            process.stdout.write(`${Mensaje}\n\r`, 'utf8');
        } else {
            if (Mensaje.forEach) {
                Mensaje.forEach((Valor) => {
                    this.Enviar(Valor);
                });
                process.stdout.write(`\n\r`, 'utf8');
            } else {
                process.stdout.write('[Base] Intentaste enviar un objeto diferente a String o String[]\n\r');
            }
        }
    }
    /**
     * Termina la ejecución del programa.
     */
    static Finalizar() {
        process.exit();
    }
}