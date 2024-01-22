import ServerCore, { Debug } from "../ServerCore.js";


// Preparación previa a los test`s
Debug.ShowAll = true;
const $Test = new Debug('Test', 'Test/.Debug');


const Env = {
    Port: 3000,
    Host: null
}

// Prueba de inicio de servidor.
const Server = new ServerCore(Env.Port, Env.Host);

// Creando reglas de enrutamiento.
Server.AddFile('/File', 'changes.md')
.AddFolder('/Folder', '.Debug')
.AddAction('ALL', '/', (Rq, Rs) => {
    Rs.SendTemplate('Test/Test.HSaml', {
        Tittle: '[Saml] · Tests',
        Sources: {
            File: '/File',
            Folder: '/Folder',
            WebSocket: '/WebSocket',
            "WebSocket Online": '/WebSocket2'
        }
    });
})
.AddAction('ALL', 'WebSocket', (Rq, Rs) => {
    Rs.SendTemplate('Test/WebSocket.HSaml', {
        Host: 'ws://localhost/WebSocket'
    });
}) /*
.AddAction('ALL', 'WebSocket2', (Rq, Rs) => {
    Rs.SendTemplate('Test/WebSocket.HSaml', {
        Host: 'wss://portForwardUrl'
    });
}) */
.AddWebSocket('/WebSocket', (() => {
    /**@type {Set<ServerCore.WebSocket>} */
    const Clients = new Set();
    return (Rs, Ws) => {
        Clients.add(Ws);
        Clients.forEach(Client => { if (Client !== Ws) Client.Send('Server: Alguien se ha conectado') });
        Ws.on('Message', (Info, Data) => {
            if (Info.OPCode == 0x1) {
                let Message = Data.toString();
                $Test.Log(['WS', Message]);
                Clients.forEach(Client => { if (Client !== Ws) Client.Send(Message) });
            }
        });
        Ws.on('Error', (Error) => {
            $Test.Log('[Ws·Error]: ' + Error.message);
        });
        Ws.on('Finish', () => {
            Clients.forEach(Client => { if (Client !== Ws) Client.Send('Server: Alguien se ha desconectado') });
            Clients.delete(Ws);
        });
    };
})(), true);