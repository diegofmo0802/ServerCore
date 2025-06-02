/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Provides utilities for console interaction, including text formatting and coloring.
 * @license Apache-2.0
 */

export class ConsoleUI {
    private static formatString = '%prefix%((?:(?:[BC])[0-7])|[NSPIR])';
    private static rgbString = '%prefix%(?:([BC])\\((?:([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}),([0-2]?[0-9]{1,2}))\\))';
    private static readonly formats = {
        // Var: Code    // Text color
        C0: '\x1B[30m', // Black
        C1: '\x1B[31m', // Red
        C2: '\x1B[32m', // Green
        C3: '\x1B[33m', // Yellow
        C4: '\x1B[34m', // Blue
        C5: '\x1B[35m', // Magenta
        C6: '\x1B[36m', // Cyan
        C7: '\x1B[37m', // White
        C: '\x1B[38;2;R;G;Bm', // (R,G,B)
        // Var: Code    // Background color
        B0: '\x1B[40m', // Black background
        B1: '\x1B[41m', // Red background
        B2: '\x1B[42m', // Green background
        B3: '\x1B[43m', // Yellow background
        B4: '\x1B[44m', // Blue background
        B5: '\x1B[45m', // Magenta background
        B6: '\x1B[46m', // Cyan background
        B7: '\x1B[47m', // White background
        B: '\x1B[48;2;R;G;Bm', // (R,G,B)
        // Var: Code     // Text format
        N:    '\x1B[1m', // Bold
        S:    '\x1B[4m', // Underline
        P:    '\x1B[5m', // Blink
        I:    '\x1B[7m', // Invert
        R:    '\x1B[0m', // Reset
        none: ''
    };

    /**
     * Delete text formats and colors.
     * Removes all custom formatting and color codes from a string,
     * returning a plain text string.
     * @param text - The input string potentially containing formatting codes.
     * @param prefix - The custom prefix used for formatting codes (default: '&').
     */
    public static cleanFormat(text: string, prefix: string = '&'): string {
        const formatExp = new RegExp(this.formatString.replace('%prefix%', prefix), 'g');
        const rgbExp = new RegExp(this.rgbString.replace('%prefix%', prefix), 'g');
        return text.replace(formatExp, '').replace(rgbExp, '');
    }

    /**
     * Applies formatting and colors to text for console output using specific codes.
     * This method processes a string, replacing custom formatting and color codes with
     * ANSI escape codes to enable rich text output in terminals that support them.
     *
     * @param text - The input string containing formatting codes.
     * @param prefix - The character used to denote a formatting or color code.
     *                 Defaults to `&`.
     *
     * @returns The formatted string with ANSI escape codes.
     *
     * ---
     *
     * The formatting and coloring system works by identifying sequences starting with the
     * defined `prefix` followed by a specific code. These codes are then replaced with
     * the corresponding ANSI escape codes.
     *
     * **Available Codes:**
     *
     * | Code             | Description                                     | Example        |
     * | ---------------- | ----------------------------------------------- | -------------- |
     * | `%prefix%N`      | **Bold**                                        | `&NBold Text&R`|
     * | `%prefix%S`      | Underline                                       | `&SUnderlined&R`|
     * | `%prefix%P`      | Blink (Support varies)                          | `&PBlinking&R` |
     * | `%prefix%I`      | Invert (Swap foreground/background)             | `&IInverted&R` |
     * | `%prefix%R`      | Reset (All formatting)                          | `&RNormal&R`   |
     *
     * | Standard Colors | Description       | Foreground Code | Background Code | Example       |
     * | --------------- | ----------------- | --------------- | --------------- | ------------- |
     * | `0`             | Black             | `%prefix%C0`    | `%prefix%B0`    | `&C0Black&R`  |
     * | `1`             | Red               | `%prefix%C1`    | `%prefix%B1`    | `&B1Red BG&R` |
     * | `2`             | Green             | `%prefix%C2`    | `%prefix%B2`    | `&C2Green&R`|
     * | `3`             | Yellow            | `%prefix%C3`    | `%prefix%B3`    | `&B3Yellow BG&R`|
     * | `4`             | Blue              | `%prefix%C4`    | `%prefix%B4`    | `&C4Blue&R` |
     * | `5`             | Magenta           | `%prefix%C5`    | `%prefix%B5`    | `&B5Magenta BG&R`|
     * | `6`             | Cyan              | `%prefix%C6`    | `%prefix%B6`    | `&C6Cyan&R` |
     * | `7`             | White             | `%prefix%C7`    | `%prefix%B7`    | `&B7White BG&R`|
     *
     * | RGB Colors          | Description                                   | Example (Text) | Example (BG) |
     * | ------------------- | --------------------------------------------- | -------------- | ------------ |
     * | `%prefix%C(R,G,B)`  | Foreground color using RGB (0-255 for R,G,B) | `&C(255,0,0)Red` | N/A          |
     * | `%prefix%B(R,G,B)`  | Background color using RGB (0-255 for R,G,B) | N/A            | `&B(0,0,255)Blue BG` |
     *
     * **Notes:**
     *
     * - Do not include spaces after the commas within the parentheses for RGB codes.
     * - Multiple codes can be combined, e.g., `&N&C1Bold Red Text&R`.
     * - The `%prefix%R` code is automatically appended to the end of the output string
     *   to ensure subsequent console output is not affected by the formatting.
     * - Terminal support for colors and formatting may vary.
     * ---
     *
     * **Examples:**
     * - `&N&C4Bold Blue Text&R`: Displays "Bold Blue Text" in bold and blue, then resets formatting.
     * - `&B2Green Background&R`: Displays "Green Background" with a green background and default text color, then resets.
     * - `&C(255,165,0)&SOrange Underlined Text&R`: Displays "Orange Underlined Text" in orange and underlined, then resets.
     * - `&IInverted Colors&R`: Displays "Inverted Colors" with foreground and background colors swapped, then resets.
     * - `&N&C1Error: &R&C7File not found.` : Displays "Error:" in bold red and "File not found." in white, then resets.
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
