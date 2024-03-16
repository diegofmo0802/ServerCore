import PATH from 'path';
import URL from 'url';

class Path {
    ModuleDir = null;
    ModuleMain = null;
    constructor() {
        // @ts-ignore
        this.ModuleDir = PATH.dirname(PATH.dirname(URL.fileURLToPath(import.meta.url)));
        this.ModuleMain = PATH.join(this.ModuleDir, 'ServerCore.js');
    }
    /**
     * Limpia una ruta.
     * - Transforma las `\` en `/`
     * @param {string} Path La ruta que desea limpiar.
     */
    Normalize(Path) {
        Path = Path.replace(/[\\/]/gi, PATH.sep);
        return Path;
    }
    /**
     * Convierte una ruta relativa en una completa.
     * @param {string} Path La ruta relativa.
    */
   Relative(Path) {
        Path = this.Normalize(Path);
        Path =  PATH.join(this.ModuleDir, Path);
        return PATH.normalize(Path);
    }
}

class Utilities {
    static Path = new Path;
};

export default Utilities;