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
     * Convierte una ruta relativa en una completa.
     * - Por el momento solo se admite `/` en lugar de `\`
     * @param {string} Path La ruta relativa.
     */
    Relative(Path) {
        Path = Path.replace(/[\\/]/gi, PATH.sep);
        Path = PATH.join(this.ModuleDir, Path);
        return PATH.normalize(Path);
    }
}

class Utilities {
    static Path = new Path;
};

export default Utilities;