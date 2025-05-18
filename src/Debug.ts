/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the debug system to the server core.
 * @license Apache-2.0
 */

import fs, { WriteStream } from 'fs';
import ConsoleUI from './ConsoleUI.js';

export class Debug {
	private static debugs: Debug.debugMap = new Map;
	public static showAll: boolean = false;
	private id: string;
	private show: boolean;
	private save: boolean;
	private startDate: Debug.Date;
	private path: string | null;
	private rootPath: string;
	private stream: WriteStream | null;
	/**
	 * create or get a debug instance
	 * @param id the id of the debug instance
	 * @param path the path to the debug file
	 * @param show whether to show the debug in the console
	 * @param save whether to save the debug in a file
	 * @returns the debug instance
	 */
    public static getInstance(id: string = '_debug', path: string = '.debug', show: boolean = true, save: boolean = true) {
		const d = Debug.debugs.get(id) ?? new Debug(id, path, show, save);
		return d;
	}
	/**
	 * create a new debug instance
	 * @param id the id of the debug instance
	 * @param path the path to the debug file
	 * @param show whether to show the debug in the console
	 * @param save whether to save the debug in a file
	 * @private
	 */
	private constructor(id: string = '_default', path: string = '.debug', show: boolean = true, save: boolean = true) {
		path = path.startsWith('/') ? path.slice(1) : path;
		path = path.endsWith('/') ? path.slice(0, -1) : path;
		this.id = id;
		this.rootPath = path
		this.show = show;
		this.save = save;
		this.startDate = Debug.getDate();
        this.path = save ? this.getFilePath() : null;
        this.stream = save ? this.getStream() : null;
		Debug.debugs.set(id, this);
	}
	/**
	 * define if the logs will be shown in the console.
	 * @param show the state to set.
	 */
	public setShow(show: boolean): void { this.show = show; }
	/**
	 * define if the logs will be saved in a file.
	 * @param InFile the state to set.
	 */
	public setSave(InFile: boolean): void {
		this.save = InFile;
		if (this.save) {
            this.path = this.getFilePath();
            this.stream = this.getStream();
        } else if(this.stream) {
            this.stream.destroy();
            this.stream = null;
        }
	}
	/**
	 * get the path to the debug file.
	 * @returns the path to the debug file.
	 * @private
	 */
    private getFilePath(): string {
        if (this.path) return this.path;
		const file = `[${this.id}] - ${this.startDate.hour}.${this.startDate.minute}.${this.startDate.second}.${this.startDate.miliSecond}.DSaml`;
		const folder = `${this.rootPath}/[${this.startDate.day}.${this.startDate.month}.${this.startDate.year}]`;
		const path = `${folder}/${file}`;
        return path;
    }
	/**
	 * get the stream to the debug file.
	 * @returns the stream to the debug file.
	 * @private
	 */
	private getStream(): WriteStream {
        if (this.stream && ! this.stream.destroyed) return this.stream;
        const path = this.getFilePath();
		const folder = path.slice(0, path.lastIndexOf('/'));
		if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
		const date = Debug.getDate();
		const stream = fs.createWriteStream(path, 'utf8');
		stream.write('/*+----------------------------+*/\n');
		stream.write('/*| Saml/Debug by diegofmo0802 |*/\n');
		stream.write('/*|     Use Saml ReadDebug     |*/\n');
		stream.write('/*+----------------------------+*/\n');
		stream.write(`/*the name of the DebugFile is the DateTime of initialize Debug with ID ${this.id}*/\n`);
		stream.write(`/*the initialize stream DateTime is ${date.DDMMYYYY} << ${date.HHMMSSms}*/\n`);
		if (this.save) {
			const Prefix = Debug.getPrefix();
			console.log(ConsoleUI.formatText(`&B(255,0,0)&C(255,255,0)${Prefix}&R Debug: [${this.id}] --| Guardado en |-> ${this.path}`));
		}
        return stream;
    }
	/**
	 * log data to the console and the debug file.
	 * @param data the data to log.
	 */
	public log(...data: any[]): void {
		const prefix = Debug.getPrefix();
		if (this.save) {
			const stream = this.getStream();
            const toSave = data.map((Datum) => typeof Datum === 'string' ?
                ConsoleUI.cleanFormat(Datum) : Datum
            );
			stream.write(`${prefix} -> ${JSON.stringify(toSave)}\n`);
		}
		if (this.show || Debug.showAll) {
            const decoratedPrefix = ConsoleUI.formatText(`&B(255,0,0)&C(255,255,0)${prefix}&R`);
            const toShow = data.map((Datum) => typeof Datum === 'string' ?
                ConsoleUI.formatText(Datum) : Datum
            );
            console.log(decoratedPrefix, ...toShow);
        }
    }
	
	/**
	 * log data to the console and the debug file.
	 * @param data the data to log.
	 */
	public static log(...Data: any): void  {
		const debug = this.getInstance();
		debug.log(...Data);
	}
	/**
	 * generate a data time stamp
	 * @returns the data time stamp
	 * @private
	 */
	private static getPrefix(): string  {
		const now = Debug.getDate();
		const prefix = `[${now.hour}:${now.minute}:${now.second}:${now.miliSecond}]`;
		return prefix;
	}
	/**
	 * get the current date
	 * @returns the current date
	 * @private
	 */
	private static getDate(): Debug.Date {
		const now = new Date;
		const [day, month, year, hour, minute, second, miliSecond] = [
			now.getDate()        .toString().padStart(2, '0'),
			(now.getMonth() + 1) .toString().padStart(2, '0'),
			now.getFullYear()    .toString().padStart(4, '0'),
			now.getHours()       .toString().padStart(2, '0'),
			now.getMinutes()     .toString().padStart(2, '0'),
			now.getSeconds()     .toString().padStart(2, '0'),
			now.getMilliseconds().toString().padStart(3, '0')
		];
		const dmyFormat = `${day}-${month}-${year}`;
		const hhmmssmsFormat = `${hour}.${minute}.${second}.${miliSecond}`;
		return {
			day: day,
			month: month,
			year: year,
			hour: hour,
			minute: minute,
			second: second,
			miliSecond: miliSecond,
			DDMMYYYY: dmyFormat,
			HHMMSSms: hhmmssmsFormat,
			Date: now
		};
	}
}

export namespace Debug {
	export type debugMap = Map<string, Debug>;
	export interface Date {
		day: string,
		month: string,
		year: string,
		hour: string,
		minute: string,
		second: string,
		miliSecond: string,
		DDMMYYYY: string,
		HHMMSSms: string,
		Date: globalThis.Date
	};
}

export default Debug;