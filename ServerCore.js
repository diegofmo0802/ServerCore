/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade el espacio de nombre Saml e Inicia los módulos requeridos por `[Servidor].js`.
 * @license Apache-2.0
 */

import Debug from "./Debug/[Debug].js";
import Plantilla from "./Plantilla/[Plantilla].js";
import Servidor from "./Servidor/[Servidor].js";

const ServerCore = Servidor;
const Saml = {
	Debug:  Debug,
	Plantilla: Plantilla
};

export default ServerCore;
export {
	ServerCore,
	Saml
};