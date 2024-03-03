declare namespace Utilities { }

declare class Utilities {
    public static Path: {
        ModuleDir: string,
        ModuleMain: string
        /**
         * Limpia una ruta.
         * - Transforma las `\` en `/`
         * @param Path La ruta que desea limpiar.
         */
        Normalize: (Path: string) => string
    }
};

export default Utilities;