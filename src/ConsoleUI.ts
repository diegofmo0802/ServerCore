/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description contains the basic functionalities for module saml tools
 * @license Apache-2.0
 */

export class ConsoleUI {
    private static formatString = '%prefix%((?:(?:[BC])[0-7])|[NSPIR])';
    private static rgbString = '%prefix%(?:([BC])\\((?:([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}))\\))';
    private static formats = {
        // Var - Code          --      Text color
        C0:   '\x1B[30m',         // Black
        C1:   '\x1B[31m',         // Red
        C2:   '\x1B[32m',         // Green
        C3:   '\x1B[33m',         // Yellow
        C4:   '\x1B[34m',         // Blue
        C5:   '\x1B[35m',         // Magenta
        C6:   '\x1B[36m',         // Cyan
        C7:   '\x1B[37m',         // White
        C:    '\x1B[38;2;R;G;Bm', //(R,G,B)
        // Var - Code          --      Background color
        B0:   '\x1B[40m',         // Black
        B1:   '\x1B[41m',         // Red
        B2:   '\x1B[42m',         // Green
        B3:   '\x1B[43m',         // Yellow
        B4:   '\x1B[44m',         // Blue
        B5:   '\x1B[45m',         // Magenta
        B6:   '\x1B[46m',         // Cyan
        B7:   '\x1B[47m',         // White
        B:    '\x1B[48;2;R;G;Bm', //(R,G,B)
        // Var - Code          --      Text format
        N:    '\x1B[1m',          // Bold
        S:    '\x1B[4m',          // Underline
        P:    '\x1B[5m',          // Blink
        I:    '\x1B[7m',          // Invert
        R:    '\x1B[0m',          // Reset
        none: ''
    };

    /**
     * Delete text formats and colors.
     * @param text - The text to clean.
     * @param prefix - The prefix.
     */
    public static cleanFormat(text: string, prefix: string = '&'): string {
        const formatExp = new RegExp(this.formatString.replace('%prefix%', prefix), 'g');
        const rgbExp = new RegExp(this.rgbString.replace('%prefix%', prefix), 'g');
        return text.replace(formatExp, '').replace(rgbExp, '');
    }

    /**
     * Colors the text.
     * @param text - The text to color.
     * @param prefix - The prefix.
     * The default prefix is `&`
     * Colors and formats
     * - Formats:
     * - - `N`: Bold
     * - - `S`: Underline
     * - - `P`: Blink
     * - - `I`: Invert
     * - - `R`: Reset
     * - `B`: Used before a color to refer to the background.
     * - - Example: `&B2Hello` will change the background of the text to green.
     * - `C`: Used before a color to refer to the text.
     * - - Example: `&C2Hello` will change the color of the text to green.
     * - Colors:
     * - - `(R,G,B)`: an RGB color, replace R, G, and B with their respective values.
     * - - - No spaces after the `,`
     * - - - Example: `&B(0,255,0)Hello` will change the background of the text to green.
     * - - - Example: `&C(0,255,0)Hello` will change the color of the text to green.
     * - - `0`: Black
     * - - `1`: White
     * - - `2`: Green
     * - - `3`: Cyan
     * - - `4`: Blue
     * - - `5`: Magenta
     * - - `6`: Red
     * - - `7`: Yellow
     */
    public static formatText(text: string, prefix: string = '&'): string {
        const formatExp = new RegExp(this.formatString.replace('%prefix%', prefix), 'g');
        const rgbExp = new RegExp(this.rgbString.replace('%prefix%', prefix), 'g');
        return `${text
            .replace(formatExp, (result, format) => this.formats[format as ConsoleUI.formatKey])
            .replace(rgbExp, (result, type, R, G, B) => (this.formats[type as ConsoleUI.formatKey]
                .replace('R', R)
                .replace('G', G)
                .replace('B', B)
            ))
        }${this.formats.R}`;
    }

    /**
     * Sends a message to the user through the console
     * @param message - The message(s) you want to send to the user
     * @param newLine - Whether there is a line break or not
     */
    public static send(message: string | string[], newLine?: boolean): void {
        if (typeof message === 'string') {
            process.stdout.write(`${message}${newLine ? '\n' : ''}`, 'utf8');
        } else if (Array.isArray(message)) {
            message.forEach((value) => {
                this.send(value);
            });
            if (newLine) process.stdout.write(`\n`, 'utf8');
        } else {
            process.stdout.write('[consoleUI] You tried to send a failed type \n');
        }
    }
}

export namespace ConsoleUI {
    export type formatKey = (
        'N' | 'S' | 'P' | 'I' | 'R' |
        'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C' |
        'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B'
    );
} 

export default ConsoleUI;
