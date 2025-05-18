# Importante

> [!IMPORTANT]
> La futura versión **3.7.0** será omitida hasta la versión **4.0.0**.
> La razón de esta decisión fue que hubo cambios que afectan la compatibilidad
> entre las versiones **3.6.5** y **3.7.0**:
>
> Se está planteando que las funcionalidades **beta.mail** y **beta.jwt** se muevan a módulos separados.
> Esta decisión dependerá de qué tan grandes se vuelvan dichas funcionalidades. Por el momento, y para la futura versión **4.0.0**,
> seguirán estando en el lugar habitual, aunque con ciertos cambios que afectan la compatibilidad con las funciones beta
> incorporadas en la versión **3.6.5**.
>
> Recuerda que puedes acceder a la versión de desarrollo descargando la rama **dev** del repositorio o por medio de npm:
> ```bash
> npm i mysaml.servercore@Dev
> ```
>
> Como último punto, se planea cambiar el nombre del módulo en npm. Se darán detalles cuando se decida cuál será, y se agregará como dependencia a la última versión de **ServerCore** que sea desplegada en npm.


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
const server = new ServerCore(80, null, {
  pubKey: 'Cert/MiDominio.pem',    //El archivo con la clave publica       (Obligatorio)
  privKey: 'Cert/MiDominio.key',   //El archivo con la  clave privada      (Obligatorio)
  port: 443                        //El puerto donde se abrirá el servidor (Opcional)
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
   ```
**AuthExec**
Es una función que recibe como parámetro la petición del http
esta debe retornar un valor booleano, true para decir que la petición esta autenticada y false para decir que no lo esta.
**Ejemplo**:
```js
// si la petición se hace con el QueryParam Auth y es igual a AuthYes se confirmara la autenticidad de la petición
server.addFile('/FileWA', 'changes.md', (Request) => {
    return Request.queryParams.has('Auth') && Request.queryParams.get('Auth') == 'AuthYes'
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
server.addFolder('/MyFolder', 'Test');


// Usando el constructor de la clase Rule:
// De esta manera tienes mayor control sobre la creación de la regla.
server.addRules(
    /*
      este constructor acepta 5 parámetros para crearse correctamente:
      Tipo, Método, UrlRule, Content, AuthExec.
      AuthExec es opcional.
    */
    new ServerCore.Rule('Folder', 'GET', '/MyFolder/', 'Test/', () => true),
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
server.addFile('/MyFile', 'changes.md');


// Usando el constructor de la clase Rule:
// De esta manera tienes mayor control sobre la creación de la regla.
server.addRules(
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
server.addAction('GET', '/', (request, response) => {
    if (request.cookies.has('User_ID')) {
      response.send("El User_ID que estas usando es:" + request.cookies.get('User_ID'));
    } else {
      response.sendFile('./ErrorUsuario.html');
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
  new ServerCore.Rule('Action', 'GET', '/', (request, response) => {
    if (request.cookies.has('User_ID')) {
      response.send("El User_ID que estas usando es:" + request.cookies.get('User_ID'));
    } else {
      response.sendFile('./ErrorUsuario.html');
    }
  })
);
```

### WebSocket

Esto te permite gestionar una conexión WebSocket completa:
> [!NOTE]
> Las url de los web sockets van por medio distinto al de las peticiones de File, Folder y Action por ende
> no tendrán conflictos si son similares o iguales a ellas


```js
// Usando AddWebSocket
/*
  Esta función acepta 3 parámetros:
  UrlRule, Action, AuthExec.
    AuthExec es opcional.
*/
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
  new ServerCore.Rule('WebSocket', 'GET', '/Test/WS-Chat', (request, socket) => {
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
