# Version 3
**Desarrollados sin añadir y en espera de pruebas**
- Mail: acceso desde (saml.servercore/Mail/Mail.js)
- JsonWT: acceso desde (saml.servercore/JsonWT/JsonWT.js)

## 3.4

### 3.4.2
**Correcciones**
  - Mail: error de tipos para la función SendMail.
  - Mail: error de importación de Debug.
  - JsonWT: error de coincidencias entre los tipos y los return de GetContent (Head y body eran objetos y no Maps).
**Añadido**
  - Mail: Se añadió como exportación Beta.
  - JsonWT: Se añadió como exportación Beta.
  - Utilities: Se creo para añadir variables o códigos útiles, tales como la ruta principal del modulo 
    aunque esta cambie.
**Eliminado**
  - Tools: El comando CSV-To-JSON
**Cambios**
  - Server: El orden de los parámetros de AddFile, AddAction y AddWebSocket.
  - Session: El atributo `path` por defecto de la cookie SS_UUID se cambio a `/` para ajustarse al
    cambio realizado en el sub modulo cookie
  - Session: La cookie SS_UUID se renombro a Session
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
  - Mail: permite enviar correos electrónicos a traves de un servidor smtp/s

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