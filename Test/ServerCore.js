import ServerCore from "../ServerCore.js";

const Servidor = new ServerCore(80);

Servidor.Añadir_Reglas({
    Método: 'GET', Url: '/',
    Tipo: 'Carpeta', Opciones: {
        Recurso: './'
    }
});