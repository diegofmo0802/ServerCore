import Debug from "./Debug/[Debug].js";
import Plantilla from "./Plantilla/[Plantilla].js";
import Servidor from "./Servidor/[Servidor].js";

const ServerCore = Servidor;
const Saml = {
	Debug: Debug,
	Plantilla: Plantilla
}

export default ServerCore;
export {
	ServerCore,
	Saml
};
module.exports = ServerCore;