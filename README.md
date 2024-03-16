# ServerCore

Hola! soy [diegofmo0802](https://diegofmo0802.github.io).<br/>
Como comente  anteriormente en mi perfil, ServerCore permitirá:

- [x] Crear servidores HTTP y HTTPS.
- [ ] **En proceso** Sistema de plantillas.
- [x] Gestionar conexiones WebSocket.
- [ ] Gestionar negociaciones de WebRTC.
- [ ] Gestionar notificaciones WebPush.

Es posible que algunos de los puntos anteriores se subdividan en proyectos diferentes<br/>
o que se cree un gestor de paquetes para implementar las funcionalidades dentro del mismo<br/>

## Sobre el proyecto

Actualmente tengo en local una copia del proyecto con varias de las funcionalidades<br/>
este comenzó como un proyecto personal y con fines de práctica de pensamiento lógico<br/>
por lo tanto no tiene las mejores prácticas ni la mejor documentación, sin embargo<br/>
publicaré el código de esta manera e iré modificando para corregir esto.

```console
mpm install saml.servercore
```

**Futuras correcciones**

- [x] Documentar clases y funciones para intellisense.
- [x] Cambiar los nombres de variables, funciones, clases y descripciones a inglés.
- [ ] **en proceso** Crear documentación para enseñar a usar el módulo.
- [ ] **en proceso** Buscar y corregir malas practicas.

Esto es todo por el momento, [diegofmo0802](https://diegofmo0802.github.io) se retira.

# Documentación 

Primero debemos instalar el modulo usando

```console
mpm install saml.servercore
```

También es necesario que en tu package.json este el proyecto como type: module
```json
{
  "name": "my-project",
  "main": "index.js",
  "type": "module"
}
```

Una ves tengas ServerCore en tu proyecto y lo hayas configurado como modulo debes importarlo<br/>
-->
- Si en tu package.json tienes la propiedad `"type": "module"`:
  ```js
  import ServerCore from 'saml.servercore';
  ```
- Si no tienes esta propiedad usa:
  ```js
  //Actualmente no esta soportado, en futuras versiones se ampliara su compatibilidad
  ```

## Servidor HTTP

Para crear un servidor HTTP puedes hacerlo de diferentes maneras:

> [!NOTE]
> Debes haber importado el modulo primero.

- Solo pasando el puerto

  ```js
  const Server = new ServerCore(80);
  ```

- Pasando Puerto y Host

  ```js
  const Server = new ServerCore(80, 'MiDominio.com');
  ```

## Servidor HTTPS

> [!NOTE]
> - Debes tener un certificado ssl (la clave publica y privada).
> - Si no quieres especificar un host usa `null`.
> - Actualmente se inicia el servidor HTTP y HTTPS a la vez en este caso
>   esto se corregirá y se pondrá como característica opcional en futuras versiones.

```js
const Server = new ServerCore(80, null, {
  Public: 'Cert/MiDominio.pem',    //El archivo con la clave publica       (Obligatorio)
  Private: 'Cert/MiDominio.key',   //El archivo con la  clave privada      (Obligatorio)
  Port: 443                        //El puerto donde se abrirá el servidor (Opcional)
});
```

## Agregar enrutador

En **`ServerCore`** existen 4 clases de enrutador:

|Tipo                   |Descripción                                          |
|----------------------:|:----------------------------------------------------|
|[Folder](#carpeta)     |Comparte una carpeta y sus sub-carpetas              |
|[File](#archivo)       |Comparte un único archivo                            |
|[Action](#acción)      |Te permite trabajar completamente con las solicitudes|
|[WebSocket](#websocket)|Permite manejar conexiones WebSocket en esa ruta     |

Los Métodos aceptados actualmente son:

|Método|Descripción                                 |
|-----:|:-------------------------------------------|
|GET   |El método de petición `GET`.                |
|POST  |El método de petición `POST`.               |
|PUT   |El método de petición `PUT`.                |
|DELETE|El método de petición `DELETE`.             |
|ALL   |Todos los métodos anteriormente mencionados.|

Como funciona la RuleUrl:<br/>

Actualmente la RuleUrl acepta 2 características
 - Comodín * toma todas las sub rutas incluyendo hasta antes de *
   - para /test/* tomaría /test y todo lo demás como /test/algo-mas/x
   - para /test2/*/Algo tomaría /Test2/(cualquier-cosa)/Algo
     es como el comodín $ solo que no guardara en una variable
 - Toma parámetros de la url usando $ seguido del nombre de la variable
   y se puede acceder a ellas desde `Request.RuleParams`
   **Ejemplo**:
   ```js
   Server.AddAction('ALL', '/User/$UserID/Post/$PostID', (Rq, Rs) => {
        Rs.SendJSON({
            Url: Rq.Url,
            RuleParams: Rq.RuleParams
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
   ```
**AuthExec**
Es una función que recibe como parámetro la petición del http
esta debe retornar un valor booleano, true para decir que la petición esta autenticada y false para decir que no lo esta.
**Ejemplo**:
```js
// si la petición se hace con el QueryParam Auth y es igual a AuthYes se confirmara la autenticidad de la petición
Server.AddFile('/FileWA', 'changes.md', (Request) => {
  return Request.GET.has('Auth') && Request.GET.get('Auth') == 'AuthYes'
});
```


### Carpeta

Comparte una carpeta y todo su contenido tanto archivos como sub-carpetas

> [!WARNING]
> - ⚠️No compartas la raíz de tu proyecto, ya que esto daría acceso a **TODO** su contenido.
>   - Datos privados como las llaves privadas de tus certificados.
>   - Contraseñas a bases de datos que estén en los archivos js del lado del servidor.
>   - Tokens de seguridad
>   y en general cualquier otro dato
> - Esto tomara la ruta que le asignes de forma completa
>   **Ejemplo**: si le asignas la ruta `/src` tomaría todas las sub-rutas como `/src/estilos` 

Para añadir este tipo de regla usa:

```js
// Usando AddFile
/*
  Esta función acepta 3 parámetros:
  UrlRule, Source, AuthExec.
    AuthExec es opcional.
*/
Server.AddFile('/MyFolder', 'Test');


// Usando el constructor de la clase Rule:
// De esta manera tienes mayor control sobre la creación de la regla.
.AddRules(
  /*
    este constructor acepta 5 parámetros para crearse correctamente:
    Tipo, Método, UrlRule, Content, AuthExec.
    AuthExec es opcional.
  */
  new ServerCore.Rule('File', 'GET', '/MyFolder/', 'Test/', () => true),
);

```

### Archivo

Comparte un archivo especifico

```js
// Usando AddFolder
/*
  Esta función acepta 3 parámetros:
  UrlRule, Source, AuthExec.
    AuthExec es opcional.
*/
Server.AddFolder('/MyFile', 'changes.md');


// Usando el constructor de la clase Rule:
// De esta manera tienes mayor control sobre la creación de la regla.
.AddRules(
  /*
    este constructor acepta 5 parámetros para crearse correctamente:
    Tipo, Método, UrlRule, Content, AuthExec.
    AuthExec es opcional.
  */
  new ServerCore.Rule('File', 'GET', '/MyFile/*', 'changes.md', () => true),
);
```

### Acción

Te permite tener total control sobre esas peticiones:

```js
// Usando AddAction
/*
  Esta función acepta 4 parámetros:
  Método, UrlRule, Action, AuthExec.
    AuthExec es opcional.
*/
Server.AddAction('GET', '/', (Request, Response) => {
    if (Request.Cookies.has('User_ID')) {
      Response.Send("El User_ID que estas usando es:" + Request.Cookies.get('User_ID'));
    } else {
      Response.SendFile('./ErrorUsuario.html');
    }
  }
);


// Usando el constructor de la clase Rule:
// En este caso no hay diferencia a usar AddAction e incluso deberás especificar el tipo.
Server.AddRules(
  /*
    este constructor acepta 5 parámetros para crearse correctamente:
    Tipo, Método, UrlRule, Content, AuthExec.
    AuthExec es opcional.
  */
  new ServerCore.Rule('Action', 'GET', '/', (Request, Response) => {
      if (Request.Cookies.has('User_ID')) {
        Response.Send("El User_ID que estas usando es:" + Request.Cookies.get('User_ID'));
      } else {
        Response.SendFile('./ErrorUsuario.html');
      }
    }
  )
);
```

### WebSocket

Esto te permite gestionar una conexión WebSocket completa:

```js
// Usando AddWebSocket
/*
  Esta función acepta 3 parámetros:
  UrlRule, Action, AuthExec.
    AuthExec es opcional.
*/
const Conexiones = new Set();
Server.AddWebSocket('/Test/WS-Chat', (Request, WebSocket) => {
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
  });
});


// Usando el constructor de la clase Rule:
// En este caso no hay diferencia a usar AddWebSocket e incluso deberás especificar el tipo y el método.
const Conexiones = new Set();
Server.AddRules(
  /*
    este constructor acepta 5 parámetros para crearse correctamente:
    Tipo, Método, UrlRule, Content, AuthExec.
    AuthExec es opcional.
    A pesar de recibir el método este no se tomara en cuenta para las conexiones web socket.
  */
  new ServerCore.Rule('WebSocket', 'GET', '/Test/WS-Chat', (Request, WebSocket) => {
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
    });
  })
);
```

# Version Dev

## En desarrollo

En el momento están en desarrollo:
- [JsonWT]: El uso de Json Web Tokens.
- [Mail]: El envió de E-Mails.
- [Server]: El sistema de autenticación dinámico para las reglas de enrutamiento.

## Instalación

Para instalar la version en desarrollo:
```console
mpm install saml.servercore@Dev
```
> [!WARNING]
> - Esta version podría contener errores.
> - Contiene la version mas reciente del proyecto.

Para acceder a las funciones en desarrollo sin añadir mencionadas en changes.md
```js
import { Beta } from 'saml.servercore'
const Mail = Beta.Mail;
const JsonWT = Beta.JsonWT;
```