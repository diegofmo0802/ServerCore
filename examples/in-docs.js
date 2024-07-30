//@ts-check
// en caso de haber instalado el modulo desde npm usar:
// import ServerCore from 'saml.servercore';
import ServerCore from '../build/ServerCore.js';

const server = new ServerCore(3000, undefined, {
    privKey: "",
    pubKey: "",
    port: 443
});

// | RULE PARAMS EXAMPLE |
server.addAction('ALL', '/User/$UserID/Post/$PostID', (request, response) => {
    response.sendJson({
        url: request.url,
        ruleParams: request.ruleParams
    });
    /* Esto devolverá lo siguiente si la ruta fuera /User/111111/Post/222222
       {
          "Url": "/User/111111/Post/222222"
          "RuleParams": {
              "UserID": "111111",
              "PostID": "222222"
          }
       }
    */
});

// | AUTH EXEC EXAMPLE |
server.addFile('/FileWA', 'changes.md', (Request) => {
    return Request.queryParams.has('Auth') && Request.queryParams.get('Auth') == 'AuthYes'
});

// | FOLDER RULE EXAMPLE |
server.addFolder('/MyFolder', 'Test');

// | FILE RULE EXAMPLE |
server.addFile('/MyFile', 'changes.md');

// | ACTION RULE EXAMPLE |

server.addAction('GET', '/', (request, response) => {
    if (request.cookies.has('User_ID')) {
      response.send("El User_ID que estas usando es:" + request.cookies.get('User_ID'));
    } else {
      response.sendFile('./ErrorUsuario.html');
    }
  }
);

// | WBB SOCKET RULE EXAMPLE |

const Conexiones = new Set();
server.addWebSocket('/Test/WS-Chat', (request, socket) => {
  console.log('[WS] CM: Conexión nueva')
  Conexiones.forEach((Usuario) => Usuario.Send("Un usuario se conecto"));
  Conexiones.add(socket);
  socket.on('finish', () => Conexiones.delete(socket));
  socket.on('error', (error) => console.log('[WS-Error]:', error));
  socket.on('message', (data, info) => {
    //console.log(Info.OPCode);
    if (info.opCode == 1) {
      console.log('[WS] MSS:', data.toString());
      Conexiones.forEach((Usuario) => {
        if (Usuario !== socket) Usuario.Send(data.toString());
      });
    } else if (info.opCode == 8) {
      Conexiones.forEach((Usuario) => Usuario.Send("Un usuario se desconecto"));
    }
  });
});

// | ADD RULE METHOD EXAMPLE |
server.addRules(
    /*
      este constructor acepta 5 parámetros para crearse correctamente:
      Tipo, Método, UrlRule, Content, AuthExec.
      AuthExec es opcional.
    */
    new ServerCore.Rule('Folder', 'GET', '/MyFolder2/', 'Test/', () => true),
    new ServerCore.Rule('File', 'GET', '/MyFile2/*', 'changes.md', () => true),
    new ServerCore.Rule('Action', 'GET', '/2', (request, response) => {
        if (request.cookies.has('User_ID')) {
          response.send("El User_ID que estas usando es:" + request.cookies.get('User_ID'));
        } else {
          response.sendFile('./ErrorUsuario.html');
        }
    }),
    new ServerCore.Rule('Action', 'GET', '/2', (request, response) => {
        if (request.cookies.has('User_ID')) {
          response.send("El User_ID que estas usando es:" + request.cookies.get('User_ID'));
        } else {
          response.sendFile('./ErrorUsuario.html');
        }
    })
);