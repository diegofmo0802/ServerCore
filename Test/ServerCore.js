import ServerCore, { Debug } from "../ServerCore.js";

const Server = new ServerCore(80);
Debug.ShowAll = true;

//Test De Acción y carga de plantillas
Server.AddRules({
    Method: 'ALL', Url: '/', Type: 'Action', Options: {
        Coverage: 'Partial', Action: function(RQ, RS) {
            let RQC = RQ.Session.Data.get('Request_Count') ?? 0;
            RQ.Session.Data.set('Request_Count', RQC + 1);
            let Contents = {};
            RQ.Session.Data.forEach((Value, Key) => Contents[Key] = Value);
            RS.SendJSON({
                SS_UUID: RQ.Session.SS_UUID,
                SS_Data: Contents,
                Cookies: RQ.Cookies
            });
        }
    }},
    {
    Method: 'GET', Url: '/Test',
    Type: 'Action', Options: {
        Coverage: 'Partial',
        Action: (Petición, Respuesta) => {
            Respuesta.SendTemplate('./Test/Plantilla.HSaml', {
                Titulo: 'Tests',
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
Server.AddRules({
    Method: 'GET', Url: '/Test/Dir',
    Type: 'Folder', Options: {
        Source: './'
    }
});
//Test De Archivo
Server.AddRules({
    Method: 'GET', Url: '/Test/File',
    Type: 'File', Options: {
        Coverage: 'Complete',
        Source: 'README.md'
    }
});
//Test de regla de WebSocket
Server.AddRules((() => {
    const Conexiones = new Set();
    return {
        Method: 'GET', Url: '/Test/WS-Chat',
        Type: 'WebSocket', Options: {
            Coverage: 'Partial',
            Action: (Petición, WebSocket) => {
                console.log('[WS] CM: Conexión nueva')
                Conexiones.forEach((Usuario) => Usuario.Send("Un usuario se conecto"));
                Conexiones.add(WebSocket);
                WebSocket.on('Finish', () => Conexiones.delete(WebSocket));
                WebSocket.on('Error', (Error) => console.log('[WS-Error]:', Error));
                WebSocket.on('Message', (Info, Datos) => {
                    //console.log(Info.OPCode);
                    if (Info.OPCode == 1) {
                        console.log('[WS] MSS:', Datos.toString());
                        Conexiones.forEach((Usuario) => {
                            if (Usuario !== WebSocket) Usuario.Send(Datos.toString());
                        });
                    } else if (Info.OPCode == 8) {
                        Conexiones.forEach((Usuario) => Usuario.Send("Un usuario se desconecto"));
                    }
                })
            }
        }
    };
})());