/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Exports the main utilities of the ServerCore module.
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
import JwtManager from "./Beta/JwtManager.js";
import Mail from "./Beta/Mail.js";

// Exports the beta utilities of the ServerCore module.
export const Beta = { JwtManager, Mail };

// Exports the main utilities of the ServerCore module.
export {
	Debug, Logger,
	Utilities, Template,
	Config,
};
export default ServerCore;