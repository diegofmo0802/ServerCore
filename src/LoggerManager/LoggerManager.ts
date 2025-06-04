/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Adds a logger manager to have an instance of the ServerCore loggers.
 * @license Apache-2.0
 */

import Debug from "../Debug.js";
import _Logger from "./Logger.js";

export class LoggerManager {
    private static instance: LoggerManager | null;
    public static getInstance(): LoggerManager {
        if (!LoggerManager.instance) LoggerManager.instance = new LoggerManager();
        return LoggerManager.instance;
    }
    public server: LoggerManager.Logger;
    public request: LoggerManager.Logger;
    public response: LoggerManager.Logger;
    public webSocket: LoggerManager.Logger;
    private constructor() {
        const $debug = Debug.getInstance();
        this.server = new LoggerManager.Logger({ prefix: 'Server', debug: $debug });
        this.request = new LoggerManager.Logger({ prefix: 'Request', debug: $debug });
        this.response = new LoggerManager.Logger({ prefix: 'Response', debug: $debug });
        this.webSocket = new LoggerManager.Logger({ prefix: 'WebSocket', debug: $debug })
    }
    public log(...data: any[]) { this.server.log(...data); }
    public info(...data: any[]) { this.server.info(...data); }
    public warn(...data: any[]) { this.server.warn(...data); }
    public error(...data: any[]) { this.server.error(...data); }
}
export namespace LoggerManager {
    export import Logger = _Logger;
}
export default LoggerManager;