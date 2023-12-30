import PATH from 'path';
import URL from 'url';

// @ts-ignore
const ModuleDir = PATH.dirname(PATH.dirname(URL.fileURLToPath(import.meta.url)));

class Utilities {
    static Path = {
        ModuleDir: ModuleDir,
        ModuleMain: `${ModuleDir}\\ServerCore.js`
    }
};

export default Utilities;