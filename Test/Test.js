import ServerCore, { Debug, Config } from "../ServerCore.js";

Config.SetShowDebug({
    Mail: true,
    Requests: true,
    Server: true,
    UpgradeRequests: true
});

// Preparación previa a los test`s
const $Test = new Debug('Test', 'Test/.Debug');

const Env = {
    Port: 3000,
    Host: null
}

// Prueba de inicio de servidor.
const Server = new ServerCore(Env.Port, Env.Host);

// Creando reglas de enrutamiento.
Server.AddFile('/File', 'changes.md')
.AddFile('/FileWA', 'changes.md',
    (Request) => Request.GET.has('Auth') && Request.GET.get('Auth') == 'AuthYes'
)
.AddRules(
    new ServerCore.Rule('File', 'GET', '/MyFile/*', 'Test/Test.js', () => true)
)
.AddFolder('/Folder', '.Debug')
.AddAction('ALL', '/', (Rq, Rs) => {
    Rs.SendTemplate('Test/Test.HSaml', {
        Tittle: '[Saml] · Tests',
        Sources: {
            File: '/File',
            FileWithAuthFunction_NoAuth: '/FileWA',
            FileWithAuthFunction_Auth: '/FileWA?Auth=AuthYes',
            Folder: '/Folder',
            RuleParams: '/RuleParams/algo1/otro2/nose3/XD',
            WebSocket: '/WebSocket',
            "WebSocket Online": '/WebSocket2'
        }
    });
})
.AddAction('ALL', '/RuleParams/$a/$b/$c/XD/*', (Rq, Rs) => {
    Rs.SendJSON({
        Url: Rq.Url,
        RuleParams: Rq.RuleParams
    })
})
.AddAction('ALL', 'WebSocket', (Rq, Rs) => {
    Rs.SendTemplate('Test/WebSocket.HSaml', {
        Host: 'ws://localhost:3000/WebSocket/'
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
        console.log("new client")
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
})());