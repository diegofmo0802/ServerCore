import PATH from 'path';
import URL from 'url';

export class Path {
    public static readonly moduleDir: string = PATH.dirname(PATH.dirname(PATH.dirname(URL.fileURLToPath(import.meta.url))));
    public static readonly moduleMain: string = PATH.join(this.moduleDir, 'build/ServerCore.js');
    /**
     * clean a path.
     * - replaces all `\` with `/`
     * @param path the path to clean
     * @returns the cleaned path
     */
    public static normalize(path: string): string {
        path = path.replace(/[\\/]/gi, PATH.sep);
        return path;
    }
    /**
     * convert a relative path to a full path.
     * @param path the relative path.
     * @returns the full path.
     */
    public static relative(path: string): string {
        path = this.normalize(path);
        path =  PATH.join(this.moduleDir, path);
        return PATH.normalize(path);
    }
}
export namespace Path {}
export default Path;