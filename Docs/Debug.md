# Indice
[Volver atrás](../)

## Lista de propiedades

|Propiedad|static|Tipo	        |Descripción                                                                    |
|--------:|-----:|-------------:|:------------------------------------------------------------------------------|
|Debugs	  |Si    |Map[ID, Debug]|Contiene todas las instancias de Debug que se han creado                       |
|ShowAll  |Si    |boolean       |Define si el contenido de todas las instancias de Debug se mostraran en consola|
<!--|File	  |No    |string        |Contiene el nombre del archivo donde se guardara la salida de Debug            |
|Folder	  |No    |string        |Contiene el la ruta de la carpeta de la salida de Debug                        |
|Path	  |No    |string        |Contiene la ruta completa del archivo de salida de Debug                       |
|StartDate|No    |Debug.ActDate |Contiene la fecha y hora de creación de la instancia de Debug                  |
|InConsole|No    |boolean       |Define si el contenido de esta instancia de Debug se mostrara en consola       |
|Stream	  |No    |WriteStream   |Contiene el stream del archivo de salida de la instancia de Debug              |-->

## Lista de métodos

|Método	                    |static     |Descripción                                              |
|--------------------------:|----------:|:--------------------------------------------------------|
|[constructor](#constructor)|constructor|Crea una instancia de Debug o devuelve una existente     |
|[Log](#log)                |Si         |Envía un log de Debug a la instancia default ID: `_Debug`|
|[Log](#static-log)         |No         |Envía un log de Debug                                    |

# Uso de los métodos

## constructor

El método constructor acepta 3 parámetros (ID, path, InConsole) y devuelve una instancia de Debug

```ts
constructor(ID: string, Path: string, InConsole: boolean): Debug
```

|Parámetro|Nulo|Tipo   |Default |Descripción                                                              |
|--------:|---:|------:|-------:|:------------------------------------------------------------------------|
|ID       |Si  |string |"_Debug"|El ID que tendrá la instancia de debug                                   |
|Path     |Si  |string |".Debug"|La ruta de la carpeta donde se guardara el archivo de salida, por defecto|
|InConsole|Si  |boolean|true    |Define si se mostraran los logs en consola                               |

```js
import { Debug } from 'ServerCore/ServerCore.js';

//Crea un Debug con ID Errores en la carpeta .Debug donde se enviaran los logs de los errores y se mostraran en consola
const _Errores = new Debug('Errores');
//Crea un Debug con ID Requests en la carpeta .Debug donde se enviaran los logs de las peticiones pero no se mostrara en consola
const _Requests = new Debug('Requests', null, false)
//Crea un Debug con ID Requests en la carpeta DebManager donde se enviaran los logs de las peticiones completadas pero no se mostrara en consola
const _Completed = new Debug('Completed', 'DebManager', false)
```

## Log

El método constructor acepta 3 parámetros (...Data)

```ts
Log(...Data: Array<any>): void;
```

> [!WARNING]
> Si envías un objeto como parámetro, no puede tener redundancia.
> Esto quiere decir que no debe tener referencias a el mismo.

|Parámetro|Nulo|Tipo|Default|Descripción                       |
|--------:|---:|---:|------:|:---------------------------------|
|Data     |No  |Any	|       |Los datos que se enviaran como log|

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

## Static Log

Funciona exactamente igual que el [parámetro Log](#log) que no es estático, solo que este enviará los logs
a la instancia por defecto de Debug que tiene ID `_Debug` y salida en la carpeta `.Debug`

# Definiciones de tipo para Debug

## Debug.ActDate
```ts
namespace Debug {
    type ActDate = {
		Day: string,
		Month: string,
		Year: string,
		Hour: string,
		Minute: string,
		Second: string,
		MiliSecond: string,
		DDMMYYYY: string,
		HHMMSSmmm: string,
		Date: Date
	};
}
```