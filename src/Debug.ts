/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Add the debug system to the server core.
 * @license Apache-2.0
 */

import fs, { WriteStream } from 'fs';
import ConsoleUI from './ConsoleUI.js';
import Utilities from './Utilities/Utilities.js';

export class Debug {
	private static debugs: Debug.debugMap = new Map();
    public static showAll: boolean = false;
    private id: string;
    public show: boolean;
    private _save: boolean;
    private filePath: string;
    private rootPath: string;
	private startDate: Debug.Date;
    private stream: WriteStream | null;
    /**
     * Retrieves an existing debug instance by its ID or creates a new one if it doesn't exist.
     * @param id - The unique identifier for the debug instance. Defaults to `'_debug'`.
	 * @param options - Debug instance options
     * @returns The debug instance
     */
    public static getInstance(id: string = '_debug', options: Debug.options = {}): Debug {
        const debug = Debug.debugs.get(id)
		if (!debug) return new Debug(id, options);
		debug.save = options.save ?? debug.save;
		debug.show = options.show ?? debug.show;
		return debug;
    }
    /**
     * Constructs a new Debug instance. This constructor is private and should not be called directly. Use `Debug.getInstance()` instead.
     * @param id - The unique identifier for the debug instance. Defaults to `'_default'`.
	 * @param options - Debug instance options
     */
    private constructor(id: string = '_default', options: Debug.options = {}) {
        const { path = '.debug', show = true, save = true } = options;
		const now = Debug.getDate();
		const rootPath = Debug.cleanPath(path);
		const filePath = Debug.getFilePath(id, rootPath, now);
        this.id = id;
        this.show = show;
        this._save = save;
        this.rootPath = rootPath;
        this.filePath = filePath;
		this.startDate = now;
        this.stream =  null;
        Debug.debugs.set(id, this);
    }
	public get save(): boolean { return this._save; }
    public set save(value: boolean) {
        this._save = value;
        if (value) this.stream = this.getStream();
        else if (this.stream) {
            this.stream.destroy();
            this.stream = null;
        }
    }
	/**
	 * Retrieves or creates the write stream to the debug file associated with this instance.
	 * @returns The stream to the debug file
	 */
	private getStream(): WriteStream {
		if (!this.stream)  {
			const id = this.id;
			const date = this.startDate;
			const stream = Debug.generateStream(this.filePath);
            stream.write([
				'/* +----------------------------+* /',
				'/* | Saml/Debug by diegofmo0802 |* /',
				'/* |     Use Saml ReadDebug     |* /',
				'/* +----------------------------+* /',
				`/* the name of the DebugFile is the DateTime of initialize Debug with ID ${id} */`,
				`/* the initialize stream DateTime is ${date.DateFormat} << ${date.TimeFormat} */`,
                '', ''
			].join('\n'));
			this.stream = stream;
            const file = Utilities.Path.relative(this.filePath);
            this.log(`&C2&PStream created to the debug file: &C6&S${file}`);
		}
		return this.stream;
	}
    /**
     * Logs data with a '[LOG]' prefix to the console (if enabled) and/or the debug file (if enabled).
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public log(...data: any[]): void { this.customLog('&C2[LOG]', ...data); }
    /**
     * Logs data with an '[INF]' prefix (for informational messages) to the console (if enabled) and/or the debug file (if enabled).
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public info(...data: any[]): void { this.customLog('&C6[INF]', ...data); }
    /**
     * Logs data with a '[WRN]' prefix (for warnings) to the console (if enabled) and/or the debug file (if enabled).
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public warn(...data: any[]): void { this.customLog('&C3[WRN]', ...data); }
    /**
     * Logs data with an '[ERR]' prefix (for errors) to the console (if enabled) and/or the debug file (if enabled).
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public error(...data: any[]): void { this.customLog('&C1[ERR]', ...data); }
    /**
     * Logs data with a custom prefix to the console (if enabled) and/or the debug file (if enabled).
     * @param data - Data to log
     */
    public customLog(prefix: string, ...data: any[]): void {
        const timestamp = Debug.getTimestamp();
        if (this._save) this.saveLog(timestamp, prefix, ...data);
        if (this.show || Debug.showAll) this.showLog(timestamp, prefix, ...data);
    }
	/**
	 * Displays the log entry on the console.
     * @param timestamp - The timestamp of the log entry.
	 * @param prefix - The prefix for the log entry.
	 * @param data - The data to be displayed.
	 */
	private showLog(timestamp: string, prefix: string, ...data: any[]): void {
        timestamp = Debug.decorateTimestamp(timestamp);
        timestamp = ConsoleUI.formatText(timestamp);
        prefix = ConsoleUI.formatText(prefix);
		const toShow = data.map((Datum) => typeof Datum === 'string' ?
			ConsoleUI.formatText(Datum) : Datum
		);
		console.log(`${timestamp} ${prefix} ->`, ...toShow);
	}
	/**
	 * Saves the log entry to the debug file.
     * @param timestamp - The timestamp of the log entry.
	 * @param prefix - The prefix for the log entry.
	 * @param data - The data to be saved.
	 */
	private saveLog(timestamp: string, prefix: string, ...data: any[]): void {
        timestamp = ConsoleUI.cleanFormat(timestamp);
        prefix = ConsoleUI.cleanFormat(prefix);
		const stream = this.getStream();
		const toSave = data.map((datum) => typeof datum === 'string' ?
			ConsoleUI.cleanFormat(datum) : datum
		);
		stream.write(`${timestamp} ${prefix} -> ${JSON.stringify(toSave)}\n`);
	}
    /**
     * Logs data with a '[LOG]' prefix using the default debug instance.
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public static log(...data: any[]): void {
        const debug = this.getInstance();
        debug.log(...data);
    }
    /**
     * Logs data with an '[INF]' prefix using the default debug instance.
     * @param data - The data to be logged. Can be multiple arguments of any type.
     */
    public static info(...data: any[]): void {
        const debug = this.getInstance();
        debug.info(...data);
    }
    /**
     * Logs data with a '[WRN]' prefix using the default debug instance.
     * @param data - Data to log
     */
    public static warn(...data: any): void {
        const debug = this.getInstance();
        debug.warn(...data);
    }
    /**
     * Logs data with an '[ERR]' prefix using the default debug instance.
     * @param data - Data to log
     */
    public static error(...data: any): void {
        const debug = this.getInstance();
        debug.error(...data);
    }
	/**
	 * Clean a path.
	 * @param path - Path to clean
	 * @returns Cleaned path
	 */
	private static cleanPath(path: string): string {
		path = Utilities.Path.normalize(path);
		path = path.startsWith('/') ? path.slice(1) : path;
		path = path.endsWith('/') ? path.slice(0, -1) : path;
		return path;
	}
    /**
     * Get the path to the debug file.
	 * @param id - Debug instance ID
	 * @param folderPath - Path to the debug folder
	 * @param date - Date of the debug instance
     * @returns The path to the debug file
     */
    private static getFilePath(id: string, folderPath: string, date: Debug.Date): string {
        const file = `[${id}] - ${date.hour}.${date.minute}.${date.second}.${date.millisecond}.DSaml`;
        const folder = `${folderPath}/[${date.day}.${date.month}.${date.year}]`;
        const path = `${folder}/${file}`;
        return path;
    }
    /**
     * Generate a stream to the debug file.
	 * @param id - Debug instance ID
	 * @param filePath - Path to the debug file
	 * @param date - Date of the debug instance
     * @returns The stream to the debug file
     */
    private static generateStream(filePath: string): WriteStream {
        const folder = filePath.slice(0, filePath.lastIndexOf('/'));
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        const stream = fs.createWriteStream(filePath, 'utf8');
        return stream;
    }
	/**
	 * Decorate a timestamp with color codes.
	 * @param timestamp - timestamp to decorate
	 * @returns Decorated timestamp
	 */
	private static decorateTimestamp(timestamp: string): string {
		return ConsoleUI.formatText(`&C(255,255,255)${timestamp}&R`);
	}
    /**
     * Generate a datetime timestamp.
     * @returns Formatted datetime timestamp
     */
    private static getTimestamp(): string {
        const now = Debug.getDate();
        const prefix = `[${now.hour}:${now.minute}:${now.second}:${now.millisecond}]`;
        return prefix;
    }
    /**
     * Get the current date and time in formatted parts.
     * @returns Object containing date parts and full formats
     */
    private static getDate(): Debug.Date {
        const now   = new Date();
		const day   = now.getDate().toString().padStart(2, '0');
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const year  = now.getFullYear().toString().padStart(4, '0');

		const hour   = now.getHours().toString().padStart(2, '0');
		const minute = now.getMinutes().toString().padStart(2, '0');
		const second = now.getSeconds().toString().padStart(2, '0');
		const millisecond = now.getMilliseconds().toString().padStart(3, '0');

		const DateFormat = `${day}-${month}-${year}`;
		const TimeFormat = `${hour}.${minute}.${second}.${millisecond}`;
		const result: Debug.Date = {
			day, month, year,
			hour, minute, second, millisecond,
			DateFormat, TimeFormat, now
		};
        return result;
    }
}

export namespace Debug {
    export type debugMap = Map<string, Debug>;
	export interface options {
		path?: string;
		show?: boolean;
		save?: boolean;
	}
    export interface Date {
        day: string;
        month: string;
        year: string;
        hour: string;
        minute: string;
        second: string;
        millisecond: string;
        DateFormat: string;
        TimeFormat: string;
        now: globalThis.Date;
    }
}

export default Debug;