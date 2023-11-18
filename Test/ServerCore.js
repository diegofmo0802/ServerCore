import ServerCore, { Debug } from "../ServerCore.js";

const Server = new ServerCore(80);
Debug.ShowAll = true;

//Test De Acción y carga de plantillas
Server.AddAction( 'ALL', '/', false, function(RQ, RS) {
    let RQC = RQ.Session.Get('Request_Count') ?? 0;
    RQ.Session.Set('Request_Count', RQC + 1);
    if (RQ.Session.Get('Request_Count') > 0) RQ.Cookies.Del(`Cookie-${RQ.Session.Get('Request_Count')-1}`);
    RQ.Cookies.Set(`Cookie-${RQ.Session.Get('Request_Count')}`, 'Prueba');
    RS.SendJSON({
        SS_UUID: RQ.Session.GetID(),
        SS_Data: RQ.Session.GetAll(),
        Cookies: RQ.Cookies.GetAll(),
        Setters: RQ.Cookies.GetSetters()
    });
})
Server.AddRules({
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
Server.AddFolder('/Test/Dir', './');
//Test De Archivo
Server.AddFile( '/Test/File', true, 'README.md');
//Test de regla de WebSocket
const Conexiones = new Set();
Server.AddWebSocket('/Test/WS-Chat', false,  (Petición, WebSocket) => {
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
});