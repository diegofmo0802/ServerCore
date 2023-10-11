/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de Petición de `Saml/Server-core`.
 */

import URI from 'url';

class Petición {
	/**@type {import('http').IncomingHttpHeaders} Contiene los encabezados de la petición. */
	Cabeceras = null;
	/**@type {Map<string, string>} Contiene las cookies de la petición. */
	Cookies = null;
	/**@type {import('../Tipo').Saml.Servidor.Petición.GET} Contiene los datos POST que se enviaron. */
	GET = null;
	/**@type {string} Contiene la dirección IP de quien realizo la petición. */
	IP = null;
	/**@type {import('../Tipo').Saml.Servidor.Petición.Método} Contiene el método de la petición. */
	Método = null;
	/**@type {Promise<import('../Tipo').Saml.Servidor.Petición.POST>} Contiene los datos POST que se enviaron. */
	POST = null;
	/**@type {import('../Tipo').Saml.Servidor.Sesión} */
	Sesión = null;
	/**@type {import('http').IncomingMessage} Contiene la petición que recibió el servidor. */
	SrvPetición = null;
	/**@type {string} Contiene la url de la petición. */
	Url = null;
	/**
	 * Crea la forma de petición de `Saml/Servidor`.
	 * @param {import('http').IncomingMessage} SrvPetición La petición que recibió el servidor.
	 */
	constructor(SrvPetición) {
		this.Cabeceras = SrvPetición.headers;
		this.Cookies = this.Decodificar_Cookies(this.Cabeceras.cookie);
		this.GET = this.Variables_Get(SrvPetición.url);
		this.IP = this.Cabeceras['x-forwarded-for']
		? SrvPetición.headers['x-forwarded-for'].toString()
		: SrvPetición.socket.remoteAddress;
		this.Método = this.ObtenerMétodo(SrvPetición.method);
		this.POST = this.Datos_Post(SrvPetición);
		this.SrvPetición = SrvPetición;
		this.Url = SrvPetición.url.split('?')[0];
		this.Url = decodeURI(this.Url.endsWith('/') ? this.Url : this.Url + '/');
	}
	/**
	 * Convierte una cadena cookie en un objeto js.
	 * @param {string} Cookie El texto de la cabecera `cookie`.
	 * @returns {Map<string,string>}
	 */
	Decodificar_Cookies(Cookie) {
		if (!(Cookie)) return new Map();
		let División = Cookie.split(';');
		let Cookies = new Map();
		for (let Parte of División) {
			let [Nombre, ...Valor] = Parte.split('=');
			Cookies.set(Nombre,Valor.join('='));
		}
		return Cookies;
	};
	/**
	 * Obtiene los datos y archivos enviados por POST.
	 * @param {import('http').IncomingMessage} SrvPetición La petición que recibió el servidor.
	 * @returns {Promise<import('../Tipo').Saml.Servidor.Petición.POST>}
	 */
	Datos_Post(SrvPetición) {
		return new Promise((PrRespuesta, PrError) => {
			let Datos = Buffer.from([]);
			let Partes = [];
			/**@type {import('../Tipo').Saml.Servidor.Petición.POST} */
			let POST = {
				Archivos: new Map,
				Formato: 'Desconocido',
				Variables: new Map
			};
			SrvPetición.on('data', (Parte) => {
				if(Datos.length > 1e+8) {
					Datos = null;
					SrvPetición.destroy();
				}
				//Datos = Buffer.concat([Datos, Parte]);
				Partes.push(Parte);
			});
			SrvPetición.on('end', () => {
				Datos = Buffer.concat(Partes);
				if (this.Cabeceras['content-type']) {
					let [Formato, ...Opciones] = this.Cabeceras['content-type'].trim().split(';');
					switch(Formato.toLowerCase()) {
						case 'multipart/form-data': {
							POST.Formato = 'multipart/form-data';
							let Separador = '--' + Opciones.join(';').replace(/.*boundary=(.*)/gi, (Resultado, Separador) => Separador);
							let Variables = Datos.toString('latin1').trim().split(Separador);
							Variables.forEach((Variable) => {
								let Información  =
								/Content-Disposition: ?form-data;? ?name="(.*?)?";? ?(?:filename="(.*?)?")?(?:\s*)?(?:Content-Type: ?(.*)?)?([^]*)/i
								.exec(Variable);
								if (Información) {
									let [Nombre, Archivo, Tipo, Contenido] = Información.splice(1);
									if (Archivo) {
										try {
											//let Carpeta = `.Guardado/${this.Sesión.SS_UUID || UUID()}`;
											//let Ruta = `${Carpeta}/${Date.now()}_${UUID()}__${Archivo}`;
											//if (!FS.existsSync('.Guardado_Temp')) FS.mkdirSync('.Guardado_Temp');
											//if (!FS.existsSync(Carpeta)) FS.mkdirSync(Carpeta);
											let Datos = Buffer.from(Contenido.trim(), 'binary');
											//let Stream = FS.createWriteStream(Ruta);
											//Stream.write(Contenido.trim(), 'binary');
											POST.Archivos.set(Buffer.from(Nombre, 'binary').toString(), {
												Archivo: Datos,
												Nombre: Buffer.from(Archivo, 'binary').toString(),
												//Ruta: Ruta,
												Peso: Datos.byteLength,
												Tipo: Buffer.from(Tipo, 'binary').toString()
											});
										} catch(Error) {
											console.log('Error');
											PrError(Error);
										}
									} else POST.Variables.set(Buffer.from(Nombre, 'binary').toString(), Contenido ? Buffer.from(Contenido, 'binary').toString().trim() : null);
								}
							});
							break;
						}
						default: {
							POST.Formato = 'Desconocido';
							POST.Desconocido = Datos;
						}
					}
				}
				PrRespuesta(POST);
			});
			SrvPetición.on('error', (Error) => {
				console.log(Error);
				PrError(Error);
			});
		});
	}
	/**
	 * Obtiene los datos enviados por medio de URL QUERY.
	 * @param {string} Url La url recibida de la petición http.
	 * @returns {Map<string,string>}
	 */
	Variables_Get(Url) {
		let Ob_Url = new URI.URL(`http://x.x${Url}`);
		return new Map(Ob_Url.searchParams);
	}
	/**
	 * Define que método se uso para realizar la petición.
	 * @param {string} Método El método con el que se realizo la petición.
	 * @returns {import('../Tipo').Saml.Servidor.Petición.Método}
	 */
	ObtenerMétodo(Método) {
		return Método == 'POST'
		? 'POST'
		: Método == 'PUT' ? 'PUT'
			: Método == 'DELETE' ? 'DELETE'
			: 'GET';
	}
}
export default Petición;