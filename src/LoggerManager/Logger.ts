import ConsoleUI from "../ConsoleUI.js";
import Debug from "../Debug.js";

export const $server = Debug.getInstance('.server', {
    path: '.debug', show: true, save: true
})

export class Logger {
    private prefix: string;
    private format: string;
    private debug: Debug;
    constructor(options: Logger.Options) {
        const { prefix, format = '&R&C7', debug } = options;
        this.prefix = prefix;
        this.format = format;
        this.debug = debug ?? Debug.getInstance(ConsoleUI.cleanFormat(prefix));
    }
    public get save(): boolean { return this.debug.save; }
    public set save(value: boolean) { this.debug.save = value; }
    public get show(): boolean { return this.debug.show; }
    public set show(value: boolean) { this.debug.show = value; }
    public log (...data: any[]) { this.debug.log(`&C2[${this.prefix}&C2]:${this.format}`, ...data); }
    public warn (...data: any[]) { this.debug.warn(`&C3[${this.prefix}&C3]:${this.format}`, ...data); }
    public info (...data: any[]) { this.debug.info(`&C6[${this.prefix}&C6]:${this.format}`, ...data); }
    public error (...data: any[]) { this.debug.error(`&C1[${this.prefix}&C1]:${this.format}`, ...data); }
}
export namespace Logger {
    export interface Options {
        prefix: string;
        format?: string;
        debug?: Debug;
    }
}
export default Logger;