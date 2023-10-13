import ServerCore from "../ServerCore.js";
//const ServerCore = require("../ServerCore.js").default;

const Servidor = new ServerCore(80);

const Conexiones = new Set();

Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/ws-chat',
    Tipo: 'WebSocket', Opciones: {
        Cobertura: 'Parcial',
        Acción: (Petición, WebSocket) => {
            Conexiones.forEach((Usuario) => Usuario.Enviar("Un usuario se conecto"));
            Conexiones.add(WebSocket);
            WebSocket.on('Finalizar', () => Conexiones.delete(WebSocket));
            WebSocket.on('Error', (Error) => console.log('[WS-Error]:', Error));
            WebSocket.on('Recibir', (Info, Datos) => {
                console.log(Info.OPCode);
                if (Info.OPCode == 1) {
                    Conexiones.forEach((Usuario) => {
                        if (Usuario !== WebSocket) Usuario.Enviar(Datos.toString());
                    });
                } else if (Info.OPCode == 8) {
                    Conexiones.forEach((Usuario) => Usuario.Enviar("Un usuario se desconecto"));
                }
            })
        }
    }
});