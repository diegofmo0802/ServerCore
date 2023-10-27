/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene las funcionalidades base de las herramientas del modulo saml
 * @license Apache-2.0
 */

class ConsoleUI {
    /**
     * Elimina los formatos de color que se usan para la función CUI.Colorear().
     * @param {string} Text El texto limpiar.
     * @param {string} Prefix El prefijo.
     * @returns {string}
     */
    static CleanFormat(Text, Prefix = '&') {
        let Expressions = {
            Format: new RegExp(`${Prefix}((?:(?:[BC])[0-7])|[NSPIR])`, 'g'),
            RGB: new RegExp(`${Prefix}(?:([BC])\\((?:([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}))\\))`, 'g')
        };
        return Text
            .replace(Expressions.Format, '')
            .replace(Expressions.RGB, '');
    }
    /**
     * Permite colorear el texto.
     * @param {string} Text El texto a colorear.
     * @param {string} Prefix El prefijo.
     * @returns {string}
     */
    static Color(Text, Prefix = '&') {
        let Expressions = {
            Format: new RegExp(`${Prefix}([CB][0-7]|[NSPIR])`, 'g'),
            RGB:     new RegExp(`${Prefix}([CB])\\(([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2})\\)`, 'g'),
        };
        const Formats = {
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
        return `${Text
            .replace(Expressions.Format, (Result, G1) => Formats[G1])
            .replace(Expressions.RGB, (Result, Type, R, G, B) => (Formats[Type]
                .replace('R', R)
                .replace('G', G)
                .replace('B', B)
            ))
        }${Formats.R}`;
    }
    /**
     * Envía un mensaje al usuario a traves de la consola.
     * @param {string|String[]} Message El/Los mensaje/s que deseas enviar al usuario.
     * @param {boolean} NewLine Si hay o no un salto de linea
     */
    static Send(Message, NewLine = true) {
        if (typeof Message === 'string') {
            process.stdout.write(`${Message}${NewLine ? '\n' : ''}`, 'utf8');
        } else {
            if (Message.forEach) {
                Message.forEach((Valor) => {
                    this.Send(Valor);
                });
                if (NewLine) process.stdout.write(`\n`, 'utf8');
            } else {
                process.stdout.write('[Base] Intentaste enviar un objeto diferente a String o String[]\n');
            }
        }
    }
}

export default ConsoleUI;