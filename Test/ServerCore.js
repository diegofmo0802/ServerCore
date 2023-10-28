import ServerCore from "../ServerCore.js";

const Servidor = new ServerCore(80);

//Test De Acción y carga de plantillas
Servidor.AddRules({
    Method: 'GET', Url: '/Test',
    Type: 'Acción', Options: {
        Coverage: 'Parcial',
        Action: (Petición, Respuesta) => {
            Respuesta.SendTemplate('./Test/Test.HSaml', {
                Des: 'Una Descripción',
                Tests: {
                    WebSocket: 'Test/Ws',
                    Archivo: 'Test/File',
                    Carpeta: 'Test/Dir'
                }
            })
        }
    }
});
//Test De Carpeta
Servidor.AddRules({
    Method: 'GET', Url: '/Test/Dir',
    Type: 'Carpeta', Options: {
        Source: './'
    }
});
//Test De Archivo
Servidor.AddRules({
    Method: 'GET', Url: '/Test/File',
    Type: 'Archivo', Opciones: {
        Cobertura: 'Completa',
        Recurso: 'README.md'
    }
});
//Test de regla de WebSocket
Servidor.AddRules((() => {
    const Conexiones = new Set();
    return {
        Method: 'GET', Url: '/Test/WS-Chat',
        Tipo: 'WebSocket', Options: {
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
    };
})());