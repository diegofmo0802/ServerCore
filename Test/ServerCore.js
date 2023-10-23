import ServerCore from "../ServerCore.js";

const Servidor = new ServerCore(80);

//Test De Acción y carga de plantillas
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/Test',
    Tipo: 'Acción', Opciones: {
        Cobertura: 'Parcial',
        Acción: (Petición, Respuesta) => {
            Respuesta.EnviarHSaml('./Test/Test.HSaml', {
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
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/Test/Dir',
    Tipo: 'Carpeta', Opciones: {
        Recurso: './'
    }
});
//Test De Archivo
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/Test/File',
    Tipo: 'Archivo', Opciones: {
        Cobertura: 'Completa',
        Recurso: 'README.md'
    }
});
//Test de regla de WebSocket
Servidor.Añadir_Reglas((() => {
    const Conexiones = new Set();
    return {
        Método: 'GET', Url: '/Test/WS-Chat',
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
    };
})());