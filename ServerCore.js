/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Exporta lo necesario para usar ServerCore.
 * @module Saml.ServerCore
 * @license Apache-2.0
 */

// Utilidades principales del modulo.
import Config from "./Config/Config.js";
import Debug from "./Debug/Debug.js";
import Template from "./Template/Template.js";
import ServerCore from "./Server/Server.js";
import Utilities from "./Utilities/Utilities.js";

// Utilidades en desarrollo y sin añadir (Beta).
import JsonWT from "./JsonWT/JsonWT.js";
import Mail from "./Mail/Mail.js";

// Para exportar las utilidades en desarrollo y sin añadir.
const Beta = {
	JsonWT, Mail
};

// Exportación de utilidades.
export {
	Config, Debug, Template, ServerCore, Utilities, Beta
};

// Exportación por defecto de ServerCore.
export default ServerCore;