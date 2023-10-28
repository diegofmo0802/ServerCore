# Indice
[Volver atrás](../)
## Lista de propiedades
<table>
    <tr>
        <th>Propiedad</th>
        <th>static</th>
        <th>Tipo</th>
        <th>Descripción</th>
    </tr>
    <tr>
        <td>Debugs</td>
        <td>Si</td>
        <td>Map[ID, Debug]</td>
        <td>Contiene todas las instancias de Debug que se han creado</td>
    </tr>
    <tr>
        <td>ShowAll</td>
        <td>Si</td>
        <td>boolean</td>
        <td>Define si el contenido de todas las instancias de Debug se mostraran en consola</td>
    </tr>
    <!--<tr>
        <td><a href="#File">File</a></td>
        <td>No</td>
        <td>string</td>
        <td>Contiene el nombre del archivo donde se guardara la salida de Debug</td>
    </tr>
    <tr>
        <td><a href="#Folder">Folder</a></td>
        <td>No</td>
        <td>string</td>
        <td>Contiene el la ruta de la carpeta de la salida de Debug</td>
    </tr>
    <tr>
        <td><a href="#Path">Path</a></td>
        <td>No</td>
        <td>string</td>
        <td>Contiene la ruta completa del archivo de salida de Debug</td>
    </tr>
    <tr>
        <td><a href="#StartDate">StartDate</a></td>
        <td>No</td>
        <td><a href="#Debug.ActDate">Debug.ActDate</a></td>
        <td>Contiene la fecha y hora de creación de la instancia de Debug</td>
    </tr>
    <tr>
        <td><a href="InConsole">InConsole</a></td>
        <td>No</td>
        <td>boolean</td>
        <td>Define si el contenido de esta instancia de Debug se mostrara en consola</td>
    </tr>
    <tr>
        <td><a href="#Stream">Stream</a></td>
        <td>No</td>
        <td>WriteStream</td>
        <td>Contiene el stream del archivo de salida de la instancia de Debug</td>
    </tr>-->
</table>

## Lista de métodos

<table>
    <tr>
        <th>Método</th>
        <th>static</th>
        <th>Descripción</th>
    </tr>
    <tr>
        <td><a href="#constructor">constructor</a></td>
        <td>constructor</td>
        <td>Crea una instancia de Debug o devuelve una existente</td>
    </tr>
    <tr>
        <td><a href="#static-log">Log</a></td>
        <td>Si</td>
        <td>Envía un log de Debug a la instancia default ID: `_Debug`</td>
    </tr>
    <tr>
        <td><a href="#log">Log</a></td>
        <td>No</td>
        <td>Envía un log de Debug</td>
    </tr>
</table>

# Uso de los métodos

## constructor

El método constructor acepta 3 parámetros (ID, path, InConsole)
<table>
    <tr>
        <th>Parámetro</th>
        <th>Nulo</th>
        <th>Tipo</th>
        <th>Valor predeterminado</th>
        <th>Descripción</th>
    </tr>
    <tr>
        <td>ID</td>
        <td>Si</td>
        <td>string</td>
        <td>"_Debug"</td>
        <td>El ID que tendrá la instancia de debug</td>
    </tr>
    <tr>
        <td>Path</td>
        <td>Si</td>
        <td>string</td>
        <td>".Debug"</td>
        <td>La ruta de la carpeta donde se guardara el archivo de salida, por defecto</td>
    </tr>
    <tr>
        <td>InConsole</td>
        <td>Si</td>
        <td>boolean</td>
        <td>true</td>
        <td>Define si se mostraran los logs en consola</td>
    </tr>
<table>

```js
import { Debug } from 'ServerCore/ServerCore.js';

//Crea un Debug con ID Errores en la carpeta .Debug donde se enviaran los logs de los errores y se mostraran en consola
const _Errores = new Debug('Errores');
//Crea un Debug con ID Requests en la carpeta .Debug donde se enviaran los logs de las peticiones pero no se mostrara en consola
const _Requests = new Debug('Requests', null, false)
//Crea un Debug con ID Requests en la carpeta DebManager donde se enviaran los logs de las peticiones completadas pero no se mostrara en consola
const _Completed = new Debug('Completed', 'DebManager', false)
```

# Log

El método constructor acepta 3 parámetros (...Data)
> [!WARNING]
> Si envías un objeto como parámetro, no puede tener redundancia.
> Esto quiere decir que no debe tener referencias a el mismo.
<table>
    <tr>
        <th>Parámetro</th>
        <th>Nulo</th>
        <th>Tipo</th>
        <th>Valor predeterminado</th>
        <th>Descripción</th>
    </tr>
    <tr>
        <td>Data</td>
        <td>No</td>
        <td>Any</td>
        <td></td>
        <td>Los datos que se enviaran como log</td>
    </tr>
<table>

```js
//Siguiendo el ejemplo anterior usaremos la constante Errores creada en el ejemplo del uso del método constructor
//Enviaremos un error al crear un json
try {
    /*
    Aquí tratamos de crear un JSON con la constante Error que es una instancia de Debug
    sin embargo, sabemos que tiene una referencia a si misma en el parámetro Debugs por lo que lanzara un error
    */
    let Dato = JSON.stringify({Error});
} catch(Err) {
    Error.Log('Se produjo un error al crear un json');
}
```

# Static Log

Funciona exactamente igual que el [parámetro Log](#log) que no es estático, solo que este enviará los logs
a la instancia por defecto de Debug que tiene ID `_Debug` y salida en la carpeta `.Debug`