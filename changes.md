# Version 3
**Desarrollados sin añadir y en espera de pruebas**
- Mail: acceso desde (saml.servercore/Beta/Mail.js)
- JwtManager: acceso desde (saml.servercore/Beta/JwtManager.js)

## 3.7
> [!IMPORTANT]
> **ServerCore** ha sido movido al lenguaje TypeScript
> es posible que surjan errores que no existían anteriormente
> si sufre algún error que no pueda corregir puedes decírnoslo
> trataremos de ayudarte a resolver el inconveniente

### 3.7.0
#### Cambios
- El proyecto fue movido al lenguaje TypeScript
- Las propiedades y métodos ahora comienzan por minúscula (Load -> load ...);

**Template**
- El método `load` ahora funciona con async/await en lugar de retornar una promesa directamente;
- En la carga de objetos/arrays $(name) {$key:$value}
  ahora se puede usar $(name) {%key%: %value%}
  o puedes usar $(name, customKeyName, customValueName) {%customKeyName%:%customValueName%}
**Utilities**
- Se agrego la función loadEnv, flattenObject, sleep
**Debug**
- Ahora solo se puede usar desde el método `getInstance` (esta sujeto a posibles cambios)
**Config**
- se convirtió en un singleton
**Response**
- el método send fue limitado a recibir string|buffer
- los métodos sendFile, sendFolder y sendTemplate ahora funcionan con async/await
**Request**
- el atributo GET pasa a ser queryParams
**WebSocket**
- la lógica detrás de la recepción de webSocket fue separada hacia Chunk.ts
- Chunk.ts fue optimizado
**Beta**
- JsonWT se convirtió en JwtManager

## 3.6

**Añadido**
- Server: Al crear reglas de enrutamiento puedes poner una verificación de autenticación.
- Utilities: Se agrego a Patch la función Relative que convierte una ruta relativa a completa (Relativa desde el ModuleDir).
- Server: Se añadió soporte para recibir [Form-urlencoded, Form-data, Text, Json]
- Config: Ahora se puede configurar el modulo para la depuración

**Modificado**
- Server: Se modifico el sistema de reglas de enrutamiento
  - Al crear una regla puedes usar $ para crear un parámetro Url
    - EJ: Server.AddAction("/App/User/$UserID/Post/$PostID", (rq, rs) => {}) // Guardara UserID en PostID en rq.Params.PostID y rq.Params.UserID  .
  - Al crear una regla puedes usar * para que responda a todas las sub rutas.
    - EJ: Server.AddAction("/App/Logo/*, (rq, rs) => {}) // Responderá a /App/Logo y todas las sub rutas.

### 3.6.1
  **Correcciones**
  - El package json no incluía la nueva carpeta Config, por lo que no se publico en npm.

### 3.6.2
  **Correcciones**
  - El modulo no funcionaba correctamente por la mala importación del archivo Utilities.js en Template.js

### 3.6.3
  **Correcciones**
  - Las UrlRules no funcionaban correctamente al capturar parámetros $ o al usar * entre // ej /algo/*/algo-mas.

### 3.6.4
  **Correcciones**
  - Cuando la request no tenia encabezado Mime-Type nunca se disparaba la promesa de Request.POST

### 3.6.5
  **Correcciones**
  - fix: Server.addWebSocket recibía como Auth un tipo ActionExec en lugar de AuthExec


## 3.5

**La version 3.4.2 sera considerada la 3.5 ya que trajo con sigo nuevas funciones

### 3.5.3
  **Correcciones**
  - Las carpetas no cargaban de forma adecuada ni su contenido
  - La regla Folder que exponía el contenido global de saml esta en funcionamiento /Saml:Global

### 3.5.2
  **Correcciones**
  - Cookie: La función 'Del' no eliminaba correctamente las cookies.

### 3.5.1

**Correcciones**
  - El anterior uso de SS_UUID ahora es SessionID, el no haber hecho este cambio antes hizo que no apareciese el SessionID en los log de las peticiones HTTP y WebSocket

## 3.4

### 3.4.3

### 3.4.2
**Correcciones**
  - Mail: error de tipos para la función SendMail.
  - Mail: error de importación de Debug.
  - JsonWT: error de coincidencias entre los tipos y los return de GetContent (Head y body eran objetos y no Maps).
**Añadido**
  - Mail: Se añadió como exportación Beta.
  - JsonWT: Se añadió como exportación Beta.
  - Utilities: Se creó para añadir variables o códigos útiles, tales como la ruta principal del modulo 
    aunque esta cambie.
**Eliminado**
  - Tools: El comando CSV-To-JSON
**Cambios**
  - Server: El orden de los parámetros de AddFile, AddAction y AddWebSocket.
  - Session: El atributo `path` por defecto de la cookie SS_UUID se cambió a `/` para ajustarse al
    cambio realizado en el sub modulo cookie
  - Session: La cookie SS_UUID se renombró a Session
  - Debug: La ruta por defecto de cambio a `.Debug/Default`
  - Mail: Se eliminaron los console.log y se remitieron a Debug
**Resumen**
para importar lo añadido como beta se puede usar
```js
import { Beta } from 'saml.servercore';
const Mail = Beta.Mail;
const JsonWT = Beta.JsonWT;
```

### 3.4.1
**Desarrollado sin añadir**
  - Mail: permite enviar correos electrónicos a través de un servidor smtp/s

### 3.4.0
  **Añadidos**
  - Nuevas opciones para creación de cookies con Cookie.Set: Domain, SameSite y MaxAge.
  **Cambios**
  - El estado por defecto de la opción Path en Cookie.Set: de (/) a (la ruta donde se envió el set-cookie).

## 3.3 << changes.md

### 3.3.4
  **Correcciones**
  - Definición de tipos de JsonWT: de (ObjectToMar) a (ObjectToMap).
  - Definición de tipos de Cookie: de (SetOptions.Patch) a (SetOptions.Path).

### 3.3.3
  - Se corrigieron errores en el objeto Cookie
    - Al crearse una nueva cookie en una subRuta esta era establecida con Path en dicha subRuta
      ahora se tomara '/' a menos que se indique otra cosa.
  - Se corrigieron errores de tipo en Server.d.ts en cuanto a la implementación de
    - Request
    - Response
    - Cookie
    - Session
    - WebSocket

### 3.3.2
  - Se corrigió un error en JsonWT, este se ocasionaba una excepción que finalizaba la ejecución de Saml.ServerCore en lugar de enviar false para indicar que el json no era valido

### 3.3.1
  - Se corrigió el tipo de Request.POST
    <br>Esta variable es de tipo Promise<Request.POST>
    per intellisense la detectaba como Request.POST por un fallo en las definiciones en d.ts

### 3.3.0
**Añadido**
- A partir de ahora se documentaran los cambios realizados
- Se agrego Server.AddAction()
- Se agrego Server.AddFile() 
- Se agrego Server.AddFolder()
- Se agrego Server.AddWebSocket()

**Resumen**
se añadieron como una alternativa a Server.AddRules
esto con el fin de simplificar la forma de añadir reglas de enrutamiento nuevas
ya que el uso de estas funciones disminuyen la cantidad de parámetros a pasar en un objeto,
esto debido a que cada una se especializa en añadir un tipo de regla de enrutamiento en concreto.

**Desarrollados sin añadir**:

- Capacidad de trabajo con JWT
  Crear, verificar y decodificar Json Web Tokens con los algoritmos
  ||256|384|512|
  |--|---|---|---|
  |**HS**|✅|✅|✅|
  |**RS**|✅|✅|✅|
  |**PS**|✅|✅|✅|
  |**ES**|✅|✅|✅|