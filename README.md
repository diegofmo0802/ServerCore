# ServerCore

Hola! soy [diegofmo0802](https://diegofmo0802.github.io).<br/>
Como comente  anteriormente en mi perfil, ServerCore permitirá:
- [ ] Crear servidores HTTP y HTTPS.
- [ ] Sistema de plantillas.
- [ ] Gestionar conexiones WebSocket.
- [ ] Gestionar negociaciones de WebRTC.
- [ ] Gestionar notificaciones WebPush.
<br/>
Es posible que algunos de los puntos anteriores se subdividan en proyectos diferentes<br/>
o que se cree un gestor de paquetes para implementar las funcionalidades dentro del mismo<br/>
<br/><br/><br/>

## Sobre el proyecto
Actualmente tengo en local una copia del proyecto con varias de las funcionalidades<br/>
este comenzó como un proyecto personal y con fines de práctica de pensamiento lógico<br/>
por lo tanto no tiene las mejores prácticas ni la mejor documentación, sin embargo<br/>
publicaré el código de esta manera e iré modificandolo para corregir esto.
<br/><br/>

**Futuras correcciones**
- [ ] Documentar clases y funciones.
- [ ] Traducir la documentación actual al inglés.
- [ ] Cambiar los nombres de variables, funciones, clases y descripciones a inglés.
- [ ] Buscar y corregir malas prcticas.
<br/><br/>

Esto es todo por el momento, [diegofmo0802](https://diegofmo0802.github.io) se retira.
<br/><br/><br/>

# Documentación 
<!-- Por el momento iré enlistando las funcionalidades agregadas para documentar todo debidamente en el futuro. -->
Para crear un servidor usando el modulo debes primero importarlo.<br/>
> [!NOTE]
> Por el momento **`ServerCore`** no esta en npm, por lo que debes descargar el repositorio y poner su contenido en una carpeta dentro tu proyecto.
> ```
> - Proyecto raiz
> | - ServerCore/
> | - src/
>   | - main.js
> | - package.json
> ```
<br/><br/>
Una ves tengas ServerCore en tu proyecto debes importar el artchivo `ServerCore.js`<br/>
- Si en tu package.json tienes la propiedad `"type": "module"`:
  ```js
  import ServerCore from './ServerCore/ServerCore.js';
  ```
- Si no tienes esta propiedad usa:
  ```js
  const ServerCore = require('./ServerCore/ServerCore.js').default;
  ```
<br/><br/>
## Servidot HTTP
Para crear un servidor HTTP puedes hacerlo de diferentes maneras:
> [!NOTE]
> Debes haber importado el modulo primero.
- Solo pasandole el puerto
  ```js
  const Servidor = new ServerCore(80);
  ```
- Pasandole Puerto y Host
  ```js
  const Servidor = new ServerCore(80, 'MiDominio.com');
  ```
<br/><br/>
## Servidor HTTPS
> [!NOTE]
> - Debes tener un sertificado ssl (la clave publica y privada).
> - Si no quieres especificar un host usa `null`.
> - Actualmente se inicia el servidor HTTP y HTTPS a la vez en este caso
>   esto se corregira y se pondra como caracteristica ocipnal en futuras versiones.
```js
const Servidor = new ServerCore(80, null, {
    Publico: 'Cert/MiDominio.pem', //El archivo con la clave publica
    Llave: 'Cert/MiDominio.key',   //El archivo con la  clave privada
    Puerto: 443         //(Opcional) El puerto donde se abrirá el servidor 
});
```
<br/><br/>
## Agregar enrutadores
En **`ServerCore`** existen 4 clases de enrutador:<br/>
<table>
  <tr>
    <th>Tipo</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td><a href="#carpeta">Carpeta</a></td>
    <td>Comparte una carpeta y sus subcarpetas</td>
  </tr>
  <tr>
    <td><a href="#archivo">Archivo</a></td>
    <td>Comparte un unico archivo</td>
  </tr>
  <tr>
    <td><a href="#accion">Acción</a></td>
    <td>Te permite trabajar completamente con las solicitudes </td>
  </tr>
  <tr>
    <td><a href="#websocket">WebSocket</a></td>
    <td>Permite manejar conexiones WebSocket en esa ruta</td>
  </tr>
</table>
<br/>
Los Mètodos aceptados actualmente son:<br/>
<table>
  <tr>
    <th>Mètodo</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>El metodo de petición `GET`.</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>El metodo de petición `POST`.</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>El metodo de petición `PUT`.</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>El metodo de petición `DELETE`.</td>
  </tr>
  <tr>
    <td>ALL</td>
    <td>Todos los metodos anteriormente mencionados.</td>
  </tr>
</table>
<br/>
Tipos de cobertura:<br/>
<table>
  <tr>
    <th>Cobertura</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>Completa</td>
    <td>Toma todas las subrutas y no se podran usar</td>
  </tr>
  <tr>
    <td>Parcial</td>
    <td>Se toma solo esa ruta, las subrutas pueden ser usadas en otra cosa</td>
  </tr>
</table>
<br/><br/><br/>

### Carpeta

Comparte una carpeta y todo su contenido tanto archivos como subcarpetas
> [!WARNING]
> - ⚠️No compartas la raiz de tu proyecto, ya que esto daria acceso a **TODO** su contenido.
>   - Datos privados como las llaves privadas de tus certificados.
>   - Contraseñas a bases de datos que esten en los archivos js del lado del servidor.
>   - Tokens de seguridad
>   y en general cualquier otro dato
> - Esto tomara la ruta que le asignes de forma completa
>   **Ejemplo**: si le asignas la ruta `/src` tomaria todas las subrutas como `/src/estilos` 
Para añadir este tipo de regla usa:
```js
Servidor.Añadir_Reglas({
    Método: 'ALL', Url: '/',
    Tipo: 'Carpeta', Opciones: {
        Recurso: './src'
    }
});

Servidor.Añadir_Reglas({
    Método: 'ALL', Url: '/',
    Tipo: 'Carpeta', Opciones: {
        Recurso: './global'
    }
});
```
<br/><br/><br/>

### Archivo

Comparte un archivo especifico
```js
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/',
    Tipo: 'Archivo', Opciones: {
        Cobertura: 'Completa',
        Recurso: './'
    }
});
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/',
    Tipo: 'Archivo', Opciones: {
        Cobertura: 'Parcial',
        Recurso: './'
    }
});
```

### Acción

Te permite tener total control sobre esas peticiones:
```js
Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/',
    Tipo: 'Acción', Opciones: {
        Cobertura: 'Parcial',
        Acción: (Petición, Respuesta) => {
            if (Petición.Cookies.has('User_ID')) {
                Respuesta.Enviar("El User_ID que estas usando es:" + Petición.Cookies.get('User_ID'));
            } else {
                Respuesta.EnviarArchivo('./ErrorUsuario.html');
            }
        }
    }
});
```

<br/><br/><br/>

### WebSocket

Esto te permite gestionar una conexion WebSocket completa:

```js
const Conexiones = new Set();

Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/ws-chat',
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
});
```
