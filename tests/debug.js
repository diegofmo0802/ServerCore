import Debug from "../build/Debug.js";

Debug.log('Hola mundo');
Debug.log([
    'Prueba de envió de multiples datos',
    'Para saber el comportamiento'
]);

const X = Debug.getInstance('_Debug');

X.log('Prueba para ver si creando una instancia con una ID existente se devuelve la instancia con dicha ID');
X.log('Prueba para ver si no se crea un archivo diferente con ID igual');

const Y = Debug.getInstance('SEA', undefined, false);

Y.log('Prueba para verificar que no se muestra en consola si se inicializa con EnConsola = false');

Debug.showAll = true;

Y.log('Prueba para verificar que al cambiar el atributo MostrarTodo a true se muestran incluso los Debug con EnConsola = false');

Debug.showAll = false;

Y.log('Prueba para ver si vuelven a ocultarse los mensajes en consola de los EnConsola = false después de poner MostrarTodo nuevamente en false');

Debug.log('Fin de la prueba');

export default true;