//@ts-check

import Rule from "../build/Server/Rule.js";
import ServerCore, { Debug, Utilities } from "../build/ServerCore.js";
import "./debug.js";
import "./utilities.js";

/* | HABILITAR VISTA EN CONSOLA DE LOS DEBUGS DE SERVER CORE | */
Debug.showAll = true;
/* | CREANDO UN DEBUG PARA LA SALIDA DE LOS TESTS | */
const $Test = Debug.getInstance('Test');

/* | CARGANDO VARIABLES DE ENTORNO DE PRUEBA | */

await Utilities.Env.load('tests/test.env');

const HOST = process.env.HOST;
const PORT = process.env.PORT ?
Number(process.env.PORT)
? Number(process.env.PORT)
: 5050 : 5050;
const WEBSOCKET_URL = process.env['REMOTE-WS'] ?? `ws://${HOST ?? 'localhost'}:${PORT}`;

/* | INICIANDO SERVIDOR | */
const server = new ServerCore({ port: 3000 });

/* | PRUEBAS DE REGLAS FILE | */
server.addFile('/File', 'changes.md')
server.addFile('/favicon.ico', 'Global/Source/Logo_SM_960.png');

/* | PRUEBAS DE REGLAS FILE usando AUTH | */
server.addFile('/FileWA', 'changes.md',
    (Request) => (Request.searchParams.Auth != null && Request.searchParams.Auth == 'AuthYes')
)

/* | CREANDO REGLAS CON EL CONSTRUCTOR Rule | */
server.addRules(
    new ServerCore.Rule('File', 'GET', '/MyFile/*', 'Test/Test.js', () => true)
);

/* | PRUEBAS DE REGLAS FOLDER | */
server.addFolder('/Folder', '.debug');

/* | PRUEBAS DE REGLAS ACTION | */
server.addAction('ALL', '/', (Rq, Rs) => {
    Rs.sendTemplate('tests/test.HSaml', {
        Tittle: '[Saml] · Tests',
        Sources: {
            File: '/File',
            FileWithAuthFunction_NoAuth: '/FileWA',
            FileWithAuthFunction_Auth: '/FileWA?Auth=AuthYes',
            Folder: '/Folder',
            RuleParams: '/RuleParams/algo1/otro2/nose3/XD',
            WebSocket: '/WebSocket'
        }
    });
});

/* | PRUEBAS DE URL PARAMS | */
server.addAction('ALL', '/RuleParams/$?param1/$?b/$?c/*', (Rq, Rs) => {
    Rs.sendJson({
        Url: Rq.url,
        RuleParams: Rq.ruleParams
    })
});

/* | PRUEBAS DE REGLAS WEB-SOCKET | */
/**
 * @typedef {import('../build/Server/WebSocket/WebSocket.js').WebSocket} WebSocket
 */
/** @type {Set<WebSocket>} */
const clients = new Set();
/** @type {Set<string>} */
const usernames = new Set();

/**
 * 
 * @param {string | Buffer} message 
 * @param {WebSocket | null | undefined} exclude 
 */
function broadCast(message, exclude = null) {
    clients.forEach(client => {
        if (!exclude || client !== exclude) client.send(message)
    })
}

server.addAction('ALL', 'WebSocket', (Rq, Rs) => {
    Rs.sendTemplate('tests/websocket.HSaml', {
        Host: `${WEBSOCKET_URL}/WebSocket`
    });
});

server.addWebSocket('/WebSocket/$?username', (request, socket) => {
    const username = request.ruleParams.username;
    if (!username) {
        socket.send('error: no username');
        socket.end();
        return;
    }
    if (usernames.has(username)) {
        socket.send('error: username already in use');
        socket.end();
        return;
    }
    usernames.add(username)
    clients.add(socket);
    $Test.log("[WebSocket]", "new client", username);
    
    socket.send("server: hallo");
    broadCast('server: nuevo cliente: ' + username, socket);

    socket.on('message', (data, info) => {
        if (info.opCode !== 0x1) return;
        const message = username + ': ' + data.toString();
        $Test.log(['[WebSocket]', message]);
        broadCast(message, socket);
    });
    socket.on('error', (Error) => {
        $Test.log('[WebSocket-Error]: ' + Error.message);
    });
    socket.on('finish', () => {
        clients.delete(socket);
        usernames.delete(username);
        broadCast('server: cliente desconectado: ' + username);
        $Test.log('[WebSocket-Finish]: client disconnected')
    });
});
server.start();
// new Rule('Action', 'POST', '/a/b/c/d/e/$f/*', () => {});