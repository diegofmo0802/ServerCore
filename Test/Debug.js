import Debug from "../Debug/[Debug].js";

Debug.Log('Hola mundo');
Debug.Log([
    'Prueba de envió de multiples datos',
    'Para saber el comportamiento'
])

const X = new Debug('_Debug');

X.Log('Prueba para ver si creando una instancia con una ID existente se devuelve la instancia con dicha ID');
X.Log('Prueba para ver si no se crea un archivo diferente con ID igual');

const Y = new Debug('SEA', null, false);

Y.Log('Prueba para verificar que no se muestra en consola si se inicializa con EnConsola = false');

Debug.MostrarTodo = true;

Y.Log('Prueba para verificar que al cambiar el atributo MostrarTodo a true se muestran incluso los Debug con EnConsola = false');

Debug.MostrarTodo = false;

Y.Log('Prueba para ver si vuelven a ocultarse los mensajes en consola de los EnConsola = false después de poner MostrarTodo nuevamente en false');

Debug.Log('Fin de la prueba');