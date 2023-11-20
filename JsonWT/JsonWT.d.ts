/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la capacidad de interactuar con Json Web Token`s.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';

export namespace JsonWT {
    namespace Algorithm {
        type HS = 'HS256' | 'HS384' | 'HS512';
        type RS = 'RS256' | 'RS384' | 'RS512';
        type ES = 'ES256' | 'ES384' | 'ES512';
        type PS = 'PS256' | 'PS384' | 'PS512';
    }
    namespace Signatory {
        type Algorithm = 'HMAC' | 'RSA' | 'ECDSA' | 'RSA-PSS';
        type Hash = 'SHA256' | 'SHA384' | 'SHA512';
        type Info = {
            Algorithm: Algorithm,
            Hash: Hash
        };
    }
    type Algorithm = Algorithm.ES | Algorithm.HS | Algorithm.PS | Algorithm.RS;
    type Content = {
        Verify: boolean,
        Head: Map<string, string>,
        Body: Map<String, any>,
        Signature: string
    }
    type Options = {
        Algorithm: Algorithm.HS,
        Secret: string
    } | {
        Algorithm: Algorithm.RS | Algorithm.PS | Algorithm.ES,
        Key: string,
        Public: string
    }
}

export class JsonWT {
    private Algorithm: JsonWT.Algorithm;
    private HeadB64: string;
    private Signatory: JsonWT.Signatory.Info;
    private Key: string;
    private Public: string;
    private Secret: string;
    /**
     * Crea una una instancia de JWT.
     * @param Options El token secreto para el firmado de JWT.
     */
    public constructor(Options: JsonWT.Options);
    /**
     * Genera un Json Web Token.
     * @param Body El contenido del Json Web Token.
     */
    public Generate(Body: object): string;
    /**
     * Obtiene los datos del Json Web Token.
     * @param JWT El Json Web Token del que se tomaran los datos.
     */
    public GetContent(JWT: string): JsonWT.Content;
    /**
     * Crea una firma para un JsonWebToken
     * @param BodyB64 El contenido en base64url.
     * @param HeadB64 El head en base64url (si no se pasa se tomara el proveído por JsonWT).
     */
    public Sign(BodyB64: string, HeadB64?: string): string;
    /**
     * Verifica la integridad de un JsonWebToken.
     * @param JWT El Json Web Token que deseas verificar.
     */
    public Verify(JWT: string): boolean;
    /**
     * Transforma la nomenclatura de algoritmo de JWT y separa el algoritmo de firma y el hash usado.
     */
    private GetSignatoryInfo(): JsonWT.Signatory.Info;
    /**
     * Codifica datos a base64url.
     * @param Data Los datos a codificar.
     */
    private static Base64UrlEncode(Data: string): string;
    /**
     * decodifica datos a base64url.
     * @param Data Los datos a decodificar.
     */
    private static Base64UrlDecode(Data: string): string;
    /**
     * Convierte un objeto js a un map.
     * @param Object El objeto a convertir.
     */
    private static ObjectToMar(Object: object): Map<string, any>;
    /**
     * Extrae información sobre una clave publica.
     * @param Public La clave publica.
     */
    private static GetPublicKey(Public: string): CRYPTO.KeyObject;
    /**
     * Extrae información sobre una clave privada.
     * @param Key La clave privada.
     */
    private static GetPrivateKey(Key: string): CRYPTO.KeyObject;
}
export default JsonWT;