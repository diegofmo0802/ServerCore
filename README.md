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

Tipos de cobertura:<br/>

|Cobertura|Descripción                                                        |
|--------:|:------------------------------------------------------------------|
|Complete |Toma todas las sub-rutas y no se podrán usar                       |
|Partial  |Se toma solo esa ruta, las sub-rutas pueden ser usadas en otra cosa|

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
Server.AddRules({
  Method: 'ALL', Url: '/',
  Type: 'Folder', Options: {
    Source: './src'
  }
});

Server.AddRules({
  Method: 'ALL', Url: '/',
  Type: 'Folder', Options: {
    Source: './global'
  }
});
```

### Archivo

Comparte un archivo especifico

```js
Server.AddRules({
  Method: 'GET', Url: '/',
  Type: 'File', Options: {
    Coverage: 'Complete',
    Source: './'
  }
});

Server.AddRules({
  Method: 'GET', Url: '/',
  Type: 'File', Options: {
    Coverage: 'Partial',
    Source: './'
  }
});
```

### Acción

Te permite tener total control sobre esas peticiones:

```js
Server.AddRules({
  Method: 'GET', Url: '/',
  Type: 'Action', Options: {
    Coverage: 'Partial',
    Action: (Petición, Respuesta) => {
      if (Petición.Cookies.has('User_ID')) {
        Respuesta.Enviar("El User_ID que estas usando es:" + Petición.Cookies.get('User_ID'));
      } else {
        Respuesta.EnviarArchivo('./ErrorUsuario.html');
      }
    }
  }
});
```

### WebSocket

Esto te permite gestionar una conexión WebSocket completa:

```js
const Conexiones = new Set();

Server.AddRules({
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
      });
    }
  }
});
```

# Version Dev
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