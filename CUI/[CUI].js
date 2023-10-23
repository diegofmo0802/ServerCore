/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene las funcionalidades base de las herramientas del modulo saml
 * @license Saml
 * @module saml/CUI
 */

class CUI {
    /**
     * Elimina los formatos de color que se usan para la función CUI.Colorear().
     * @param {string} Texto El texto limpiar.
     * @param {string} Prefijo El prefijo.
     * @returns {string}
     */
    static Color_limpiar(Texto, Prefijo = '&') {
        let Expresiones = {
            Formato: new RegExp(`${Prefijo}((?:(?:[BC])[0-7])|[NSPIR])`, 'g'),
            RGB: new RegExp(`${Prefijo}(?:([BC])\\((?:([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}))\\))`, 'g')
        };
        return Texto
            .replace(Expresiones.Formato, (Resultado, G1) => '')
            .replace(Expresiones.RGB, (Resultado) => '');
    }
    /**
     * Permite colorear el texto.
     * @param {string} Texto El texto a colorear.
     * @param {string} Prefijo El prefijo.
     * @returns {string}
     */
    static Color(Texto, Prefijo = '&') {
        let Expresiones = {
            Formato: new RegExp(`${Prefijo}([CB][0-7]|[NSPIR])`, 'g'),
            RGB:     new RegExp(`${Prefijo}([CB])\\(([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2})\\)`, 'g'),
        };
        const Código = {
          //Var - Código      --      Color de texto
            C0:   '\x1B[30m',         //Negro
            C1:   '\x1B[31m',         //Rojo
            C2:   '\x1B[32m',         //Verde
            C3:   '\x1B[33m',         //Amarillo
            C4:   '\x1B[34m',         //Azul
            C5:   '\x1B[35m',         //Magenta
            C6:   '\x1B[36m',         //Cían
            C7:   '\x1B[37m',         //Blanco
            C:    '\x1B[38;2;R;G;Bm', //(R,G,B)
          //Var - Código      --      Color de fondo
            B0:   '\x1B[40m',         //Negro
            B1:   '\x1B[41m',         //Rojo
            B2:   '\x1B[42m',         //Verde
            B3:   '\x1B[43m',         //Amarillo
            B4:   '\x1B[44m',         //Azul
            B5:   '\x1B[45m',         //Magenta
            B6:   '\x1B[46m',         //Cían
            B7:   '\x1B[47m',         //Blanco
            B:    '\x1B[48;2;R;G;Bm', //(R,G,B)
          //Var - Código      --      Formato del texto
            N:    '\x1B[1m',          //Negrita
            S:    '\x1B[4m',          //Subrayado
            P:    '\x1B[5m',          //Parpadeo
            I:    '\x1B[7m',          //Invertir
            R:    '\x1B[0m',          //Restablecer
        };
        return `${Texto
            .replace(Expresiones.Formato, (Resultado, G1) => Código[G1])
            .replace(Expresiones.RGB, (Resultado, Tipo, R, G, B) => (Código[Tipo]
                .replace('R', R)
                .replace('G', G)
                .replace('B', B)
            ))
        }${Código.R}`;
    }
    /**
     * Hace una pregunta al usuario.
     * @param {string} Pregunta La pregunta que se le hará al usuario.
     * @returns {Promise<string>}
     */
    static Preguntar(Pregunta) {
        return new Promise((Respuesta, Error) => {
            /**
             * Da respuesta a la promesa enviada.
             * @param {Buffer} Datos la respuesta del usuario.
             */
            function Responder(Datos) {
                let Mensaje = Datos.toString().replace(/[\n\r]+/g, '');
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

export default CUI;