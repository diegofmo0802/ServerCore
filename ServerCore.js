/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Exporta lo necesario para usar ServerCore.
 * @module Saml.ServerCore
 * @license Apache-2.0
 */

import Debug from "./Debug/Debug.js";
import Template from "./Template/Template.js";
import ServerCore from "./Server/Server.js";

import JsonWT from "./JsonWT/JsonWT.js";
import Mail from "./Mail/Mail.js";

const Beta = {
	JsonWT, Mail
};

export {
	Debug, Template, ServerCore, Beta
};

export default ServerCore;