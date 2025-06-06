/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the config validator to use in the config loader.
 * @license Apache-2.0
 */

import Config from "./Config.js";
import Logger from "../LoggerManager/Logger.js";

const $config = new Logger({ prefix: 'Config' });

export class ConfigValidators {
    /**
     * Validates the config.
     * @param config - The config to validate.
     * @returns The validated config.
     */
    public static validate(config: Config.options): Config.Main {
        const { host, port, ssl, templates } = config;
        return {
            host: this.validateHost(host),
            port: this.validatePort(port),
            ssl: this.validateSSL(ssl),
            templates: this.validateTemplates(templates)
        };
    }
    /**
     * Validates the host.
     * @param host - The host to validate.
     * @returns The validated host.
     */
    public static validateHost(host: unknown): string {
        return this.validateString(host, 'localhost', 'host');
    }
    /**
     * Validates the port.
     * @param port - The port to validate.
     * @returns The validated port.
     */
    public static validatePort(port: unknown): number {
        return this.validateNumberInRange(port, 0, 65535, Config.DEFAULT.port, 'port');
    }
    /**
     * Validates the templates.
     * @param templates - The templates to validate.
     * @returns The validated templates.
     */
    public static validateTemplates(templates: unknown): Config.Templates {
        if (!templates || typeof templates !== 'object') {
            $config.warn('templates must be an object, using defaults');
            return Config.DEFAULT.templates;
        }
        const defTemplates = Config.DEFAULT.templates;
        const templatesP = templates as Partial<Config.Templates>;
        const result: Config.Templates = {};
        for (const key in defTemplates) {
            result[key] = templatesP[key] != null ? templatesP[key] : defTemplates[key];
        }
        return result;
    }
    /**
     * Validates the ssl.
     * @param ssl - The ssl to validate.
     * @returns The validated ssl.
     */
    public static validateSSL(ssl: unknown): Config.SSLOptions | null {
        if (!ssl || typeof ssl !== 'object') {
            return null;
        }
        const sslP = ssl as Partial<Config.SSLOptions>;
        const { pubKey, privKey, port = 443 } = sslP;

        if (typeof pubKey !== 'string') {
            $config.warn('ssl.pubKey must be a string, skipping ssl');
            return Config.DEFAULT.ssl;
        }
        if (typeof privKey !== 'string') {
            $config.warn('ssl.privKey must be a string, skipping ssl');
            return Config.DEFAULT.ssl;
        }
        const validPort = this.validateNumberInRange(port, 0, 65535, 443, 'ssl.port');
        return { pubKey, privKey, port: validPort };
    }
    /**
     * Validates a string value.
     * @param value - The value to validate.
     * @param defaultValue - The default value to use if the value is not a string.
     * @param fieldName - The name of the field being validated.
     * @returns The validated string value.
     */
    private static validateString(value: unknown, defaultValue: string, fieldName: string): string {
        if (typeof value === 'string') return value;
        $config.warn(`${fieldName} must be a string, using default: ${defaultValue}`);
        return defaultValue;
    }
    /**
     * Validates a number value.
     * @param value - The value to validate.
     * @param defaultValue - The default value to use if the value is not a number.
     * @param fieldName - The name of the field being validated.
     * @returns The validated number value.
     */
    private static validateNumber(value: unknown, defaultValue: number, fieldName: string): number {
        if (typeof value === 'number') return value;
        $config.warn(`${fieldName} must be a number, using default: ${defaultValue}`);
        return defaultValue;
    }
    /**
     * Validates a number value within a given range.
     * @param value - The value to validate.
     * @param min - The minimum value of the range.
     * @param max - The maximum value of the range.
     */
    private static validateRange(value: number, min: number, max: number, defaultValue: number, fieldName: string): number {
        if (value >= min && value <= max) return value;
        $config.warn(`${fieldName} must be between ${min} and ${max}, using default: ${defaultValue}`);
        return defaultValue;
    }
    /**
     * Validates a number value within a given range.
     * @param value - The value to validate.
     * @param min - The minimum value of the range.
     * @param max - The maximum value of the range.
     * @param defaultValue - The default value to use if the value is not a number or is out of range.
     */
    private static validateNumberInRange(value: unknown, min: number, max: number, defaultValue: number, fieldName: string): number {
        const num = this.validateNumber(value, defaultValue, fieldName);
        return this.validateRange(num, min, max, defaultValue, fieldName);
    }
}
export namespace ConfigValidators {}
export default ConfigValidators;