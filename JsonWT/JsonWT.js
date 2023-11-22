/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la capacidad de interactuar con Json Web Token`s.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';

class JsonWT {
    /** @type {import('./JsonWT').JsonWT.Algorithm} */
    Algorithm = null;
    /** @type {string} */
    HeadB64 = null;
    /** @type {import('./JsonWT').JsonWT.Signatory.Info} */
    Signatory = null;
    /** @type {string} */
    Secret = null;
    /** @type {string} */
    Key = null;
    /** @type {string} */
    Public = null;

    /**
     * Crea una una instancia de JWT.
     * @param {import('./JsonWT.js').JsonWT.Options} Options El token secreto para el firmado de JWT.
     */
    constructor(Options) {
        this.Algorithm = Options.Algorithm ?? 'HS256';
        this.Signatory = this.GetSignatoryInfo();
        this.HeadB64 = JsonWT.Base64UrlEncode(JSON.stringify({
            alg: this.Algorithm,
            type: 'JWT'
        }));
        switch(this.Signatory.Algorithm) {
            case 'HMAC': {//@ts-ignore
                this.Secret = Options.Secret;
                if (!this.Secret || this.Secret.length < 6) {
                    throw new Error('Para alg: HS256, HS384 y HS512 debes usar una palabra secreta mayor a 6 caracteres')
                }
                break;
            }
            case 'RSA': {//@ts-ignore
                this.Key = Options.Key;//@ts-ignore
                this.Public = Options.Public;
                let PrivateKey = JsonWT.GetPrivateKey(this.Key);
                let PublicKey = JsonWT.GetPublicKey(this.Public);
                if (
                    PrivateKey.asymmetricKeyType !== 'rsa' ||
                    PublicKey.asymmetricKeyType !== 'rsa'
                ) { throw new Error('Debes usar claves RSA para el alg: RS256, RS384 y RS512') }
                break;
            }
            case 'RSA-PSS': {//@ts-ignore
                this.Key = Options.Key;//@ts-ignore
                this.Public = Options.Public;
                let PrivateKey = JsonWT.GetPrivateKey(this.Key);
                let PublicKey = JsonWT.GetPublicKey(this.Public);
                if (
                    PrivateKey.asymmetricKeyType !== 'rsa-pss' ||
                    PublicKey.asymmetricKeyType !== 'rsa-pss'
                ) { throw new Error('Debes usar claves RSA-PSS para el alg: PSS256, PSS384 y PSS512') }
                break;
            }
            case 'ECDSA': {//@ts-ignore
                this.Key = Options.Key;//@ts-ignore
                this.Public = Options.Public;
                let PrivateKey = JsonWT.GetPrivateKey(this.Key);
                let PublicKey = JsonWT.GetPublicKey(this.Public);
                if (
                    PrivateKey.asymmetricKeyType !== 'ec' ||
                    PublicKey.asymmetricKeyType !== 'ec'
                ) { throw new Error('Debes usar claves RSA-PSS para el alg: PSS256, PSS384 y PSS512') }
                break;
            }
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
    }
    /**
     * Genera un Json Web Token.
     * @param {Object} Body El contenido del Json Web Token.
     */
    Generate(Body) {
        let BodyB64 = JsonWT.Base64UrlEncode(JSON.stringify(Body));
        let Signature = this.Sign(BodyB64);
        return `${this.HeadB64}.${BodyB64}.${Signature}`;
    }
    /**
     * Obtiene los datos del Json Web Token.
     * @param {string} JWT El Json Web Token del que se tomaran los datos.
     */
    GetContent(JWT) {
        let Verify = this.Verify(JWT);
        let [HeadB64, BodyB64, Signature] = JWT.split('.');
        let Head = JSON.parse(JsonWT.Base64UrlDecode(HeadB64));
        let Body = JSON.parse(JsonWT.Base64UrlDecode(BodyB64));
        return { Head, Body, Verify, Signature };
    }
    /**
     * Crea una firma para un JsonWebToken
     * @param {string} BodyB64 El contenido en base64url.
     * @param {string} HeadB64 El head en base64url (si no se pasa se tomara el proveído por JsonWT).
     */
    Sign(BodyB64, HeadB64 = undefined) {
        let ToSign = `${HeadB64 ?? this.HeadB64}.${BodyB64}`;
        let Signature = '';
        switch(this.Signatory.Algorithm) {
            case 'HMAC': {
                let Hmac = CRYPTO.createHmac(this.Signatory.Hash, this.Secret);
                Hmac.update(ToSign)
                Signature = Hmac.digest('base64url');
                break;
            }
            case 'RSA': {
                let SignatureP1 = CRYPTO.sign(this.Signatory.Hash, Buffer.from(ToSign), {
                    key: this.Key,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING
                });
                Signature = SignatureP1.toString('base64url');
                break;
            }
            case 'RSA-PSS': {
                let SignatureP1 = CRYPTO.sign(this.Signatory.Hash, Buffer.from(ToSign), {
                    key: this.Key,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                });
                Signature = SignatureP1.toString('base64url');
                break;
            }
            case 'ECDSA': {
                let SignatureP1 = CRYPTO.sign(this.Signatory.Hash, Buffer.from(ToSign), {
                    key: this.Key,
                    dsaEncoding: 'ieee-p1363'
                });
                Signature = SignatureP1.toString('base64url');
                break;
            }
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
        return Signature;
    }
    /**
     * Verifica la integridad de un JsonWebToken.
     * @param {string} JWT El Json Web Token que deseas verificar.
     */
    Verify(JWT) {
        let [HeadB64, BodyB64, Signature] = JWT.split('.');
        let Verify = false;
        switch(this.Signatory.Algorithm) {
            case 'HMAC': {
                let NewSignature = this.Sign(BodyB64, HeadB64);
                Verify = Signature === NewSignature ? true : false;
                break;
            }
            case 'RSA': {
                let ToVerify = `${HeadB64}.${BodyB64}`;
                Verify = CRYPTO.verify(this.Signatory.Hash, Buffer.from(ToVerify), {
                    key: this.Public,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING,
                }, Buffer.from(Signature, 'base64url'));
                break;
            }
            case 'RSA-PSS': {
                let ToVerify = `${HeadB64}.${BodyB64}`;
                Verify = CRYPTO.verify(this.Signatory.Hash, Buffer.from(ToVerify), {
                    key: this.Public,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                }, Buffer.from(Signature, 'base64url'));
                break;
            }
            case 'ECDSA': {
                let ToVerify = `${HeadB64}.${BodyB64}`;
                Verify = CRYPTO.verify(this.Signatory.Hash, Buffer.from(ToVerify), {
                    key: this.Public,
                    dsaEncoding: 'ieee-p1363'
                }, Buffer.from(Signature, 'base64url'));
                break;
            }
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
        return Verify;
    }
    /**
     * Transforma la nomenclatura de algoritmo de JWT y separa el algoritmo de firma y el hash usado.
     * @returns {{
     *   Algorithm: import('./JsonWT').JsonWT.Signatory.Algorithm,
     *   Hash: import('./JsonWT').JsonWT.Signatory.Hash
     * }}
    */
    GetSignatoryInfo() {
        let NomAlgorithm = this.Algorithm.slice(0,2);
        let NomHash = this.Algorithm.slice(2,5);
        /**@type {import('./JsonWT').JsonWT.Signatory.Algorithm} */
        let Algorithm = null;
        /**@type {import('./JsonWT').JsonWT.Signatory.Hash} */
        let Hash = null;
        switch(NomAlgorithm) {
            case 'HS': Algorithm = 'HMAC';     break;
            case 'RS': Algorithm = 'RSA';      break;
            case 'ES': Algorithm = 'ECDSA';    break;
            case 'PS': Algorithm = 'RSA-PSS';  break;
        }
        switch(NomHash) {
            case '256': Hash = 'SHA256'; break;
            case '384': Hash = 'SHA384'; break;
            case '512': Hash = 'SHA512'; break;
        }
        return { Algorithm, Hash };
    }
    /**
     * Codifica datos a base64url.
     * @param {string} Data Los datos a codificar.
     */
    static Base64UrlEncode(Data){
        return Buffer.from(Data).toString('base64url');
    }
    /**
     * decodifica datos a base64url.
     * @param {string} Data Los datos a decodificar.
     */
    static Base64UrlDecode(Data){
        return Buffer.from(Data, 'base64url').toString('utf8');
    }
    /**
     * Convierte un objeto js a un map.
     * @param {object} Object El objeto a convertir.
     */
    static ObjectToMar(Object) {
        let Result = new Map();
        for (let Key in Object) {
            Result.set(Key, Object[Key]);
        }
        return Result;
    }
    /**
     * Comprueba si una clave publica es RSA.
     * @param {string} Public La clave publica a comprobar.
     */
    static GetPublicKey(Public) {
        let PublicKey = CRYPTO.createPublicKey({
            key: Public, format: 'pem', type: 'spki'
        });
        return PublicKey;
    }
    /**
     * Extrae información sobre una clave privada.
     * @param {string} Key La clave privada.
     */
    static GetPrivateKey(Key) {
        let PrivateKey = CRYPTO.createPrivateKey({
            key: Key, format: 'pem', type: 'pkcs8'
        });
        return PrivateKey;
    }
}

export default JsonWT;