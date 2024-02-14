[Server]
- Separar la lógica de enrutamiento en funciones mas pequeñas
- Crear funciones para las comprobaciones de los condicionales
  ternarios para mejorar la legibilidad
- Reconsiderar el uso de Session para que sea opcional para el usuario
- Poner el uso del Debug.Log como opcional al usuario para evitar la
  creación de demasiados archivos o eliminar logs viejos  
- Eliminar comentarios en el futuro: [Server/Server.js]      LN(249)
- Añadir comprobaciones para AddFile, AddFolder, AddAction, AddWebSocket: [Server/Server.js]

[Bugs]
- Al usar WSL para levantar el servidor en una carpeta de windows no cargan las carpetas por que no encuentra la plantilla Folder.HSaml.