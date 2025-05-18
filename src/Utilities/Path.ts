import PATH from 'path';
import URL from 'url';

export class Path {
    public static readonly moduleDir: string = PATH.dirname(PATH.dirname(PATH.dirname(URL.fileURLToPath(import.meta.url))));
    public static readonly moduleMain: string = PATH.join(this.moduleDir, 'build/ServerCore.js');
    /**
     * Clean a path by replacing all backslashes with the system-specific separator.
     * @param path - The path to clean
     * @returns The cleaned path
     */
    public static normalize(path: string): string {
        path = path.replace(/[\\/]/gi, PATH.sep);
        return path;
    }
    /**
     * Convert a relative path to an absolute one, relative to the module root.
     * @param path - The relative path
     * @returns The absolute path
     */
    public static relative(path: string): string {
        path = this.normalize(path);
        path = PATH.join(this.moduleDir, path);
        return PATH.normalize(path);
    }
}
export namespace Path {}
export default Path;