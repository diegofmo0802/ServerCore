# Indice
[Volver atrás](../)

## Lista de propiedades

No hay propiedades a tener en cuenta

## Lista de métodos

|Método	      |static|Descripción          |
|------------:|-----:|:--------------------|
|[Load](#load)|Si    |Envía un log de Debug|

# Uso de los métodos

## Load

El método load recibe 2 parámetros (Path, Data) y devuelve una promesa de string

```ts
Load(Path: string, Data: Object): Promise<string>;
```

|Parámetro|Nulo|Tipo   |Default|Descripción                                                              |
|--------:|---:|------:|------:|:--------------------------------------|
|Path     |No  |string |       |La ruta de la plantilla                |
|Data     |No  |Object |       |Los datos que se pasaran a la plantilla|

```js
import { Template, Debug } from 'ServerCore/ServerCore.js';

const DefDebug = new Debug();
const Errores = new Debug('Errores', 'MyDebug', true);

Template.Load('./Templates/index.HSaml', {
    Titulo: 'Page index',
    Usuarios: [
        'diegofmo0802', 'TakoMics', 'OtroUsuario'
    ]
}).then((Result) => {
    DefDebug.Log(Result) // En el caso de querer mostrarlo en el debug de ServerCore
    console.log(Result) // Solo para mostrarlo en consola
}).catch(Error => Errores.Log(Error));

```

Plantilla usada en el ejemplo anterior

```html
<!--index.HSaml-->
<html>
    <head>
        <title>$Variable{Titulo}</tile>
    </head>
    <body>
        <h1>$Variable{Titulo}</h1>
        <h2>Lista de usuarios</h2>
        <HSaml:Array>
            $HSaml:Array{Usuarios}
            <li>$Array{ID} - $Array{Valor}</li>
        </HSaml:Array>
    </body>
</html>
```