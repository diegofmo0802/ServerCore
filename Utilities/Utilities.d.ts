declare namespace Utilities { }

declare class Path {
    public ModuleDir: string;
    public ModuleMain: string;
    /**
     * Limpia una ruta.
     * - Transforma las `\` en `/`
     * @param Path La ruta que desea limpiar.
     */
    Normalize(Path: string): string;
    /**
     * Convierte una ruta relativa en una completa.
     * @param Path La ruta relativa.
     */
    Relative(Path: string): string;
}

declare class Utilities {
    public static Path: Path
};

export default Utilities;