/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description Exporta lo necesario para usar ServerCore.
 * @module Saml.ServerCore
 * @license Apache-2.0
 */

// Utilidades principales del modulo.
import Config from "./Config.js";
import Debug from "./Debug.js";
import Template from "./Template.js";
import ServerCore from "./Server/Server.js";
import Utilities from "./Utilities.js";

// Utilidades en desarrollo y sin añadir (Beta).
import JwtManager from "./Beta/JwtManager.js";
import Mail from "./Beta/Mail.js";

// Para exportar las utilidades en desarrollo y sin añadir.
const Beta = {
	JwtManager, Mail
};

// Exportación de utilidades.
export {
	Config, Debug, Template, ServerCore, Utilities, Beta
};

// Exportación por defecto de ServerCore.
export default ServerCore;