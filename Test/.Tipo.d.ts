/**
 * Cosas por hacer / ideas / recordatorio de cambio
 * - Crear el tipo Encabezado en "Respuesta"
 *   Que Encabezados establezca los encabezados de la respuesta cuando se vaya a enviar
 * 
 */

import { Debug, ServerCore, Plantilla } from '../ServerCore'

export namespace _Saml {
    namespace Servidor {
        namespace Petición {
            type Método = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
            type GET = Map<string, any>;
            type POST = {
                Archivos: Map<string, {
                    Archivo: Buffer,
                    /* Guardado: Promise<boolean> */
                    Nombre: string,
                    Peso: number //Peso en bytes,
                   // Ruta: string,
                    Tipo: string
                }>,
                Desconocido?: Buffer | String;
                Errores?: Array<String | Error>
                Formato: (
                    'application/json' |
                    'application/octet-stream' |
                    'application/xml' |
                    'application/x-www-form-urlencoded' |
                    'multipart/form-data' |
                    'text/plain' |
                    'Desconocido'
                ),
                Variables: Map<string, any>
            }
        }
        namespace Reglas {
            type Base = {
                Método: Petición.Método,
                Url: string
            };
            type Acción = Base & {
                Tipo: 'Acción',
                Opciones: {
                    Cobertura: ('Parcial'|'Completa'),
                    Acción: (Petición: Petición, Respuesta: Respuesta) => void
                }
            };
            type Archivo = Base & {
                Tipo: 'Archivo',
                Opciones: {
                    Cobertura: ('Parcial'|'Completa'),
                    Recurso: string,
                }
            };
            type Carpeta = Base & {
                Tipo: 'Carpeta',
                Opciones: {
                    Recurso: string,
                }
            };
            type WebSocket = Base & {
                Tipo: 'WebSocket',
                Opciones: {
                    Cobertura: ('Parcial' | 'Completa'),
                    Acción: (Petición: Petición, WebSocket: Servidor.WebSocket) => void
                }
            };
        }
        type Plantillas = {
            Error?: string,
            Carpeta?: string
        };
        type Reglas = Reglas.Acción | Reglas.Archivo | Reglas.Carpeta | Reglas.WebSocket;
        class Petición extends (await import('./Servidor/Petición')).default {};
        class Respuesta extends (await import('./Servidor/Respuesta')).default {};
        class Sesión extends (await import('./Servidor/Sesión')).default {
            on(Evento: 'Iniciar',   Acción: () => void) : this;
            on(Evento: 'Cerrar',    Acción: () => void) : this;
        };
        class WebSocket extends (await import('./Servidor/WebSocket')).default {
            on(Evento: 'Cerrar',    Acción: () => void): this;
            on(Evento: 'Error',     Acción: (Error: Error) => void): this;
            on(Evento: 'Finalizar', Acción: () => void): this;
            on(Evento: 'Recibir',   Acción: (Información: {OPCode: number}, Datos: Buffer) => void): this;
        }
    }
    class Servidor /* extends (await import('./Servidor/[Servidor]')).default */{
        constructor(Puerto: number, Host?: string | null, Certificado?: {
            Llave: string,
            Puerto?: number
            Publico: string,
        }): this;
        Añadir_Reglas(...Reglas: Array<Saml.Servidor.Reglas>): Servidor
        static Certificados(RutaCer: string, RutaKey: string): Promise<{
            cert: Buffer | string,
            key: Buffer | string
        }>
        Definir_Plantillas(Nombre: keyof Servidor.Plantillas, Ruta: string): Servidor
    };
}