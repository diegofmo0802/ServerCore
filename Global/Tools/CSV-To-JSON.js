import FS from 'fs';

import CUI from '../../ConsoleUI/ConsoleUI.js';

const RX_Line = /[^\r\n]+(?:\r?\n|$)/g;
const RX_Item = /(?:"(?:[^"]|"")*"|[^,\r\n]*)(?:,|$)/g;

/**
 * Convierte el archivo CSV a JSON.
 * @param {string} Ruta La ruta del archivo CSV.
 */
function Convertir(Ruta) {
    FS.readFile(Ruta, (Error, Datos) => {
        if (! Error) {
            let Contenido = Datos.toString();
            let Lineas = Contenido.match(RX_Line);
            let Cabeceras = [];
            let Conversion = [];
            Lineas.forEach((Linea, Posición) => {
                let Items = Linea.match(RX_Item);
                if (Posición == 0) {
                    Items.forEach((Item, Posición2) => {
                        Cabeceras[Posición2] = Item == ',' || Item == ''
                        ? `Columna-${Posición2}`
                        : Item.endsWith(',')
                            ? Item.slice(0, -1)
                            : Item;
                    });
                } else {
                    let Fila = Conversion[Posición-1] = {};
                    Items.forEach((Item, Posición2) => {
                        Fila[Cabeceras[Posición2]] = Item.endsWith(',') ? Item.slice(0, -1) : Item;
                    });
                }
            });
            let Salida = Ruta.replace(/.csv/g, '.json');
            FS.appendFile(Salida, JSON.stringify(Conversion), 'utf8', () => {
                CUI.Enviar([
                    'Archivo convertido correctamente',
                    `Ruta: "${Ruta}"`
                ]);
                CUI.Finalizar();
            });
        } else {
            CUI.Enviar('No se ha podido convertir el archivo.');
            CUI.Enviar(Error.toString());
            return false;
        }
    });
}
async function Iniciar() {
    console.clear();
    CUI.Enviar([
        '###########################',
        '#       CSV TO JSON       #',
        '###########################',
        '#       HR --> Saml       #',
        '#     by diegofmo0802     #',
        '###########################'
    ]);

    let Ruta = await CUI.Preguntar('Ingresa la ruta relativa/absoluta del archivo');

    if (FS.existsSync(Ruta)) {
        Convertir(Ruta);
    } else {
        await CUI.Preguntar(`El archivo no existe: "${Ruta}"`);
        Iniciar();
    }
}
Iniciar();