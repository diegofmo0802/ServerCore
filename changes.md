# Version 3
## 3.4
### 3.4.0
  **Añadidos**
  - Nuevas opciones para creación de cookies con Cookie.Set: Domain, SameSite y MaxAge
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
- A partir de ahora se documentaran los cambios realizados
- Se agrego Server.AddAction()
- Se agrego Server.AddFile() 
- Se agrego Server.AddFolder()
- Se agrego Server.AddWebSocket()

se añadieron como una alternativa a Server.AddRules
esto con el fin de simplificar la forma de añadir reglas de enrutamiento nuevas
ya que el uso de estas funciones disminuyen la cantidad de parámetros a pasar en un objeto,
esto debido a que cada una se especializa en añadir un tipo de regla de enrutamiento en concreto.

Desarrollados sin añadir:

- Capacidad de trabajo con JWT
  Crear, verificar y decodificar Json Web Tokens con los algoritmos
  ||256|384|512|
  |--|---|---|---|
  |**HS**|✅|✅|✅|
  |**RS**|✅|✅|✅|
  |**PS**|✅|✅|✅|
  |**ES**|✅|✅|✅|