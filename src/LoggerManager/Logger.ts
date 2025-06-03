import ConsoleUI from "../ConsoleUI.js";
import Debug from "../Debug.js";

export class Logger {
    private static readonly LEVEL_MAP: Logger.LevelMap = {
        log: `&C2[LOG]`,
        warn: `&C3[WRN]`,
        info: `&C6[INF]`,
        error: `&C1[ERR]`,
    }
    private prefix: string;
    private format: string;
    private debug: Debug;
    public show: boolean = true;
    public save: boolean = true;
    constructor(options: Logger.Options) {
        const { prefix, format = '&R&C7', debug } = options;
        this.prefix = prefix;
        this.format = format;
        if (debug instanceof Debug) this.debug = debug;
        else if (typeof debug === 'string') this.debug = Debug.getInstance(debug);
        else if (debug) this.debug = Debug.getInstance(debug.id, debug);
        else this.debug = Debug.getInstance(ConsoleUI.cleanFormat(prefix));
    }
    public log (...data: any[]) { this.debug.customLog(data, this.getLogOptions('log')); }
    public warn (...data: any[]) { this.debug.customLog(data, this.getLogOptions('warn')); }
    public info (...data: any[]) { this.debug.customLog(data, this.getLogOptions('info')); }
    public error (...data: any[]) { this.debug.customLog(data, this.getLogOptions('error')); }
    private getLogOptions(level: Logger.level): Debug.LogOptions {
        const prefix = `${Logger.LEVEL_MAP[level]} [${this.prefix}]${this.format}`
        return { prefix, save: this.save, show: this.show, }
    }
}
export namespace Logger {
    export type level = 'log' | 'warn' | 'info' | 'error';
    export type LevelMap = Record<level, string>;
    export interface NewDebugOptions {
        id: string;
        path?: string;
        show?: boolean;
        save?: boolean;
    }
    export interface Options {
        prefix: string;
        format?: string;
        debug?: string | Debug | NewDebugOptions;
    }
}
export default Logger;