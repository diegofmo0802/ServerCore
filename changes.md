# 3.3.0 - Inicio de changes.me
A partir de ahora se documentaran los cambios realizados

Se añadió:

- Server.AddAction()
- Server.AddFile() 
- Server.AddFolder()
- Server.AddWebSocket()

se añadieron como una alternativa a Server.AddRules
esto con el fin de simplificar la forma de añadir reglas de enrutamiento nuevas
ya que el uso de estas funciones disminuyen la cantidad de parámetros a pasar en un objeto,
esto debido a que cada una se especializa en añadir un tipo de regla de enrutamiento en concreto.

Desarrollados sin añadir:

- Capacidad de trabajo con JWT
  Crear, verificar y decodificar Json Web Tokens con los algoritmos
  - SH256
  - SH384
  - SH512
  - RS256
  - RS384
  - RS512
  - PS256
  - PS384
  - PS512