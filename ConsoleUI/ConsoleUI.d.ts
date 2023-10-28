/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Contiene las funcionalidades base de las herramientas del modulo saml
 * @license Apache-2.0
 */

class ConsoleUI {
        /**
     * Elimina los formatos de color que se usan para la función CUI.Colorear().
     * @param Text El texto limpiar.
     * @param Prefix El prefijo.
     */
    public static CleanFormat(Text: string, Prefix?: string): string
    /**
     * Permite colorear el texto.
     * @param Text El texto a colorear.
     * @param Prefix El prefijo.
     * El prefijo por defecto es `&`
     * Colores y formatos
     * - Formatos:
     * - - `N`: Negrita
     * - - `S`: Subrayado
     * - - `P`: Parpadeo
     * - - `I`: Invertir
     * - - `R`: Restablecer
     * - `B`: se usa antes de un color para referirse al fondo.
     * - - Ejemplo: `&B2Hola` cambiara el fondo del texto a verde.
     * - `C`: se usa antes de un color para referirse al texto.
     * - - Ejemplo: `&C2Hola` cambiara el color del texto a verde.
     * - Colores:
     * - - `(R,G,B)`: un color RGB, reemplace R, G y B con su valor correspondiente.
     * - - - No debe haber espacios después de las `,`
     * - - - Ejemplo: `&B(0,255,0)Hola` cambiara el fondo del texto a verde.
     * - - - Ejemplo: `&C(0,255,0)Hola` cambiara el color del texto a verde.
     * - - `0`: Negro
     * - - `1`: Blanco
     * - - `2`: Verde
     * - - `3`: Cían
     * - - `4`: Azul
     * - - `5`: Magenta
     * - - `6`: Rojo
     * - - `7`: Amarillo
     */
    public static GenerateFormat(Text: string, Prefix?: string): string
    /**
     * Envía un mensaje al usuario a traves de la consola.
     * @param Message El/Los mensaje/s que deseas enviar al usuario.
     * @param NewLine Si hay o no un salto de linea
     */
    public static Send(Message: string|Array<string>, NewLine?: boolean): void
}
export default ConsoleUI;