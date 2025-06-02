/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Provides the core server functionalities and utilities for building robust applications.
 * @module Saml.ServerCore
 * @license Apache-2.0
 */

// Imports the main utilities of the ServerCore module.
import Config from "./Config.js";
import Debug from "./Debug.js";
import Logger from "./LoggerManager/Logger.js";
import Template from "./Template.js";
import ServerCore from "./Server/Server.js";
import Utilities from "./Utilities/Utilities.js";

// Imports the beta utilities of the ServerCore module.
import _JwtManager from "./Beta/JwtManager.js";
import _Mail from "./Beta/Mail.js";

/**
 * Contains experimental or beta features of the ServerCore module.
 * Use with caution as these features may change or be removed in future versions.
 */
export namespace Beta {
	export import JwtManager = _JwtManager;
	export import Mail = _Mail;
}

/**
 * Exports the main classes and utilities provided by the Saml.ServerCore module.
 *
 * These exports include:
 * - Debug: For debugging and logging.
 * - Logger: For managing application logs.
 * - Utilities: A collection of general utility functions.
 * - Template: For handling template processing.
 * - Config: For managing server configuration settings.
 */
export {
	Debug, Logger,
	Utilities, Template,
	Config,
};
export default ServerCore;