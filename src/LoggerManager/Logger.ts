import ConsoleUI from "../ConsoleUI.js";
import Debug from "../Debug.js";

export class Logger {
    private prefix: string;
    private format: string;
    private debug: Debug;
    public show: boolean = true;
    public save: boolean = true;
    constructor(options: Logger.Options) {
        const { prefix, format = '&R&C7', debug } = options;
        this.prefix = prefix;
        this.format = format;
        this.debug = debug ?? Debug.getInstance(ConsoleUI.cleanFormat(prefix));
    }
    public log (...data: any[]) { this.debug.customLog(data, this.getLogOptions('log')); }
    public warn (...data: any[]) { this.debug.customLog(data, this.getLogOptions('warn')); }
    public info (...data: any[]) { this.debug.customLog(data, this.getLogOptions('info')); }
    public error (...data: any[]) { this.debug.customLog(data, this.getLogOptions('error')); }
    private getLogOptions(level: Logger.level): Debug.LogOptions {
        level = level.toLowerCase() as Logger.level;
        let prefix = `&C2[LOG] [${this.prefix}&C2]${this.format}`;
        switch (level) {
            case 'warn': prefix = `&C3[WAN] [${this.prefix}&C3]${this.format}`; break;
            case 'info': prefix = `&C6[INF] [${this.prefix}&C6]${this.format}`; break;
            case 'error': prefix = `&C1[ERR] [${this.prefix}&C1]${this.format}`; break;
        }
        return { prefix, save: this.save, show: this.show, }
    }
}
export namespace Logger {
    export type level = 'log' | 'warn' | 'info' | 'error';
    export interface Options {
        prefix: string;
        format?: string;
        debug?: Debug;
    }
}
export default Logger;