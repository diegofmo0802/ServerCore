import Server from './Server.js';
import ConsoleUI from '../ConsoleUI.js';
import Utilities from '../Utilities/Utilities.js';
import Logger from '../LoggerManager/Logger.js';

export class DebugUI {
    private dataHandleInstance: DebugUI.dataHandler;
    public prompt: string;
    public in: NodeJS.ReadStream;
    public out: Logger;
    public commandMap: DebugUI.CommandMap;
    public constructor(
        public server: Server
    ) {
        this.dataHandleInstance = this.dataHandler.bind(this);
        this.prompt = ConsoleUI.formatText("&C(255,180,220)[ServerCore] << &C6&S");
        this.in = process.stdin;
        this.out = new Logger({ prefix: 'C-UI', debug: 'console-ui' });
        this.commandMap = {};
        this.addDefaultCommands();
    }
    /** Starts the console UI. */
    private startReadIn() {
        this.in.on('data', this.dataHandleInstance);
        ConsoleUI.send(this.prompt);
    }
    /** Stops the console UI. */
    private stopReadIn() { this.in.off('data', this.dataHandleInstance); }
    /** Starts the console UI. */
    public start() { this.startReadIn(); }
    /** Stops the console UI. */
    public stop() { this.stopReadIn(); }
    /**
     * Handles incoming data from the client.
     * @param data - The incoming data buffer.
     */
    private async dataHandler(data: Buffer): Promise<void> {
        const [cmd, ...args] = data.toString('utf-8').trim().split(' ');
        this.out.log(`&C(80,0,80)command received: &C3${cmd}`, args);
        try {
            const command = this.commandMap[cmd];
            if (command) await command.exec.bind(this)(cmd, args);
            else this.out.error(`&C1Unknown command: &C3${cmd}`);
        } catch(error) {
            this.out.error(`&C1Error executing command: &C3${cmd}`, error);
        }
        if (cmd !== 'exit-debug') ConsoleUI.send(this.prompt);
    }
    /**
     * Gets a command by name.
     * @param command - The name of the command.
     * @returns The command or undefined if not found.
     */
    public getCommand(command: string): DebugUI.Command | undefined { return this.commandMap[command]; }
    /**
     * Adds a command to the command map.
     * @param command - The name of the command.
     * @param exec - The command execution function.
     * @param info - Additional information about the command.
     * @returns The DebugUI instance for chaining.
     */
    public addCommand(command: string, exec: DebugUI.commandExec, info?: DebugUI.CommandInfo): this {
        this.commandMap[command] = { name: command, exec, ...info };
        return this;
    }
    /**
     * Removes a command from the command map.
     * @param command - The name of the command.
     * @returns The DebugUI instance for chaining.
     */
    public removeCommand(command: string): this {
        delete this.commandMap[command];
        return this;
    }
    /** Prints the command map to the console.*/
    private addDefaultCommands() {
        this.addCommand('help', this.showHelp.bind(this), { description: '&C6Shows this help', usage: 'help' });
        this.addCommand('sv-start', this.server.start.bind(this.server), { description: '&C6Starts the server', usage: 'start' });
        this.addCommand('sv-stop', this.server.stop.bind(this.server), { description: '&C6Stops the server', usage: 'stop' });
        this.addCommand('sv-restart', this.server.restart.bind(this.server), { description: '&C6Restarts the server', usage: 'restart' });
        this.addCommand('sv-rules', this.showRules.bind(this), { description: '&C6Shows the server rules', usage: 'rules' });
        this.addCommand('sv-config', this.showConfig.bind(this), { description: '&C6Shows the server configuration', usage: 'config' });
        this.addCommand('exit-debug', this.stopReadIn.bind(this), { description: '&C6Exits the debug UI', usage: 'exit-debug' });
        this.addCommand('exit', () => process.exit(), { description: '&C6Exits the process', usage: 'exit' });;
    }
    /** Prints the server rules to the console. */
    private showRules() {
		this.out.info('&C(255,180,220)╭─────────────────────────────────────────────');
        this.out.info('&C(255,180,220)│ &C2 Rules added to server router');
		this.out.info('&C(255,180,220)├─────────────────────────────────────────────');
        for (const rule of this.server.router.rules) {
            this.out.info(`&C(255,180,220)│ &C3${rule.type.padStart(8, ' ')} rule: &C2${rule.method.padStart(5, ' ')} &R-> &C6${rule.urlRule}${typeof rule.content == 'string' ? " &C3<<&C6&S " + rule.content : ''}`);
        }
        this.out.info('&C(255,180,220)╰─────────────────────────────────────────────');
    }
    private showHelp() {
		this.out.info('&C(255,180,220)╭─────────────────────────────────────────────');
        this.out.info('&C(255,180,220)│ &C1ServerCore &C3Debugger &C1by diegofmo0802');
        this.out.info('&C(255,180,220)│ &C1Commands:');
        for (const index in this.commandMap) {
            const command = this.commandMap[index];
            this.out.info(`&C(255,180,220)│   > &C3${command.name}`);
            this.out.info(`&C(255,180,220)│     - &C(255,255,255)Usage: &C6${command.usage ?? ''}`);
            this.out.info(`&C(255,180,220)│     - &C(255,255,255)${command.description ?? ''}`);
        }
        this.out.info('&C(255,180,220)╰─────────────────────────────────────────────');
    }
    /** Prints the server configuration to the console. */
    private showConfig() {
        const { config } = this.server;
        this.out.info('&C(255,180,220)╭─────────────────────────────────────────────');
        this.out.info('&C(255,180,220)│ &C2 Server Configuration');
        this.out.info('&C(255,180,220)├─────────────────────────────────────────────');
        this.out.info(`&C(255,180,220)│ &C3Port: &C6${config.port}`);
        this.out.info(`&C(255,180,220)│ &C3Host: &C6${config.host}`);
        if (config.ssl) {
            this.out.info(`&C(255,180,220)│ &C3ssl options`);
            this.out.info(`&C(255,180,220)│   - &C3enabled: &C6${config.ssl.port ?? 443}`);
            this.out.info(`&C(255,180,220)│   - &C3cert: &C6${config.ssl.pubKey}`);
            this.out.info(`&C(255,180,220)│   - &C3key: &C6${config.ssl.privKey}`);
        }
        this.out.info(`&C(255,180,220)│ &C3server templates`);
        for (const name in config.templates) {
            const path = config.templates[name];
            this.out.info(`&C(255,180,220)│   - &C3${name}: &C6${path}`);
        }
        this.out.info(`&C(255,180,220)│ &C3Debug options`);
        this.out.info(`&C(255,180,220)│   - &C3 showAll: &C6${config.showAll}`);
        this.out.info(`&C(255,180,220)│   - &C3 show server logs: &C6${config.logger.server.show}`);
        this.out.info(`&C(255,180,220)│   - &C3 save server logs: &C6${config.logger.server.save}`);
        this.out.info(`&C(255,180,220)│   - &C3 show requests logs: &C6${config.logger.request.show}`);
        this.out.info(`&C(255,180,220)│   - &C3 save requests logs: &C6${config.logger.request.save}`);
        this.out.info(`&C(255,180,220)│   - &C3 show responses logs: &C6${config.logger.response.show}`);
        this.out.info(`&C(255,180,220)│   - &C3 save responses logs: &C6${config.logger.response.save}`);
        this.out.info(`&C(255,180,220)│   - &C3 show websockets logs: &C6${config.logger.webSocket.show}`);
        this.out.info(`&C(255,180,220)│   - &C3 save websockets logs: &C6${config.logger.webSocket.save}`);
        this.out.info('&C(255,180,220)╰─────────────────────────────────────────────');
    }
}
export namespace DebugUI {
    export type dataHandler = (data: Buffer) => void;
    export type commandExec = (this: DebugUI, command: string, args: string[]) => Promise<void> | void;
    export interface CommandInfo {
        description?: string;
        usage?: string;
    }
    export interface Command extends CommandInfo {
        name: string;
        exec: commandExec;
    }
    export interface CommandMap {
        [command: string]: Command;
    }
}
export default DebugUI;