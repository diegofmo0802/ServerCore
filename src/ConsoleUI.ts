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
     * @returns The cleaned text.
     */
    public static cleanFormat(text: string, prefix: string = '&'): string {
        const formatExp = new RegExp(this.formatString.replace('%prefix%', prefix), 'g');
        const rgbExp = new RegExp(this.rgbString.replace('%prefix%', prefix), 'g');
        return text.replace(formatExp, '').replace(rgbExp, '');
    }

    /**
     * Applies formatting and colors to text for console output using specific codes.
     * This function interprets special codes within the text to apply ANSI escape codes,
     * enabling rich text formatting and coloring in terminals that support it.
     *
     * @param text - The text to color.
     * @param prefix - The character used to denote a formatting or color code.
     *                 Defaults to `&`.
     *
     * @description
     * The formatting and coloring system works by identifying sequences starting with the
     * defined `prefix` followed by a specific code. These codes are then replaced with
     * the corresponding ANSI escape codes.
     *
     * **Available Codes:**
     *
     * - **Formats:** Modify the style of the text.
     *   - `%prefix%N`: **Bold** - Makes the text bold.
     *   - `%prefix%S`: Underline - Underlines the text.
     *   - `%prefix%P`: Blink - Makes the text blink. (May not be supported by all terminals)
     *   - `%prefix%I`: Invert - Swaps the foreground and background colors.
     *   - `%prefix%R`: Reset - Resets all formatting and colors to the default. This is automatically applied at the end of the formatted text.
     *
     * - **Color Types:** Determine whether to apply color to the foreground (text) or background.
     *   - `%prefix%C`: Followed by a color code, sets the text (foreground) color.
     *   - `%prefix%B`: Followed by a color code, sets the background color.
     *
     * - **Standard Colors:** Used with `%prefix%C` or `%prefix%B`.
     *   - `0`: Black
     *   - `1`: Red
     *   - `2`: Green
     *   - `3`: Yellow
     *   - `4`: Blue
     *   - `5`: Magenta
     *   - `6`: Cyan
     *   - `7`: White
     *
     * - **RGB Colors:** Allows for a wider range of colors using RGB values (0-255).
     *   - `%prefix%C(R,G,B)`: Sets the text color using the specified R, G, and B values.
     *     - Example: `&C(255,0,0)This text is red.`
     *   - `%prefix%B(R,G,B)`: Sets the background color using the specified R, G, and B values.
     *     - Example: `&B(0,255,0)This has a green background.`
     *   - **Note:** Do not include spaces after the commas within the parentheses.
     *
     * **Combining Codes:**
     * Multiple codes can be combined in sequence. For example, `&N&C1Hello` would make "Hello" bold and red.
     * The order of color and format codes can matter for the final appearance.
     *
     * **Examples:**
     * - `&N&C4Bold Blue Text&R`: Displays "Bold Blue Text" in bold and blue, then resets formatting.
     * - `&B2Green Background&R`: Displays "Green Background" with a green background, then resets formatting.
     * - `&C(255,165,0)&SOrange Underlined Text&R`: Displays "Orange Underlined Text" in orange and underlined, then resets.
     * - `&IInverted Colors&R`: Displays "Inverted Colors" with foreground and background colors swapped, then resets.
     * - `&N&C1Error: &R&C7File not found.` : Displays "Error:" in bold red and "File not found." in white, then resets.
     *
     * @returns The formatted text with ANSI escape codes.
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
