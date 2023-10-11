import Plantilla from "../Plantilla/[Plantilla].js";

console.log(
    await Plantilla.Cargar('./Test/Plantilla.HSaml', {
        Titulo: 'Titulo de la prueba',
        Descripción: 'Descripción xD',
        AR: {
            Algo: 'Algo 1',
            Otra: 'Otra2'
        }
    })
);