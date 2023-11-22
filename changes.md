# 3.3 Inicio de changes.me
## 3.3.1
  - Se corrigió el tipo de Request.POST
    <br>Esta variable es de tipo Promise<Request.POST>
    per intellisense la detectaba como Request.POST por un fallo en las definiciones en d.ts


## 3.3.0
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