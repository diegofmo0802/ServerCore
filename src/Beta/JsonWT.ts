/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the json web token manager to the server core.
 * @license Apache-2.0
 */

import CRYPTO from 'crypto';

export class JsonWT {
    private algorithm: JsonWT.Algorithm;
    private headB64: string;
    private signatory: JsonWT.Signatory.info;
    private privKey: string = '';
    private pubKey: string = '';
    private secret: string = '';
    /**
     * create a new JsonWT manager
     * @param options the options to create the JsonWT
     * @throws an error if the algorithm is not supported
     * @throws an error if the algorithm is HMAC and the secret have less than 6 characters
     * @throws an error if the algorithm is RSA and the key is not a valid RSA key
     * @throws an error if the algorithm is RSA-PSS and the key is not a valid RSA-PSS key
     * @throws an error if the algorithm is ECDSA and the key is not a valid ECDSA key
     */
    public constructor(options: JsonWT.options) {
        this.algorithm = options.algorithm ?? 'HS256';
        this.signatory = this.getSignInfo();
        this.headB64 = JsonWT.base64UrlEncode(JSON.stringify({
            alg: this.algorithm,
            type: 'JWT'
        }));
        switch(this.signatory.algorithm) {
            case 'HMAC': {// @ts-ignore
                this.secret = options.Secret;
                if (!this.secret || this.secret.length < 6) {
                    throw new Error('to alg: HS256, HS384 y HS512 you must provide a secret with at least 6 characters');
                }
                break;
            }
            case 'RSA': {// @ts-ignore
                this.privKey = options.Key;// @ts-ignore
                this.pubKey = options.Public;
                const PrivateKey = JsonWT.getPrivateKey(this.privKey);
                const PublicKey = JsonWT.getPublicKeyInfo(this.pubKey);
                if (
                    PrivateKey.asymmetricKeyType !== 'rsa' ||
                    PublicKey.asymmetricKeyType !== 'rsa'
                ) { throw new Error('you must provide a valid RSA key for alg: RS256, RS384 and RS512'); }
                break;
            }
            case 'RSA-PSS': {// @ts-ignore
                this.privKey = options.Key;// @ts-ignore
                this.pubKey = options.Public;
                const PrivateKey = JsonWT.getPrivateKey(this.privKey);
                const PublicKey = JsonWT.getPublicKeyInfo(this.pubKey);
                if (
                    PrivateKey.asymmetricKeyType !== 'rsa-pss' ||
                    PublicKey.asymmetricKeyType !== 'rsa-pss'
                ) { throw new Error('you must provide a valid RSA-PSS key for alg: PS256, PS384 and PS512'); }
                break;
            }
            case 'ECDSA': {// @ts-ignore
                this.privKey = options.Key;// @ts-ignore
                this.pubKey = options.Public;
                const PrivateKey = JsonWT.getPrivateKey(this.privKey);
                const PublicKey = JsonWT.getPublicKeyInfo(this.pubKey);
                if (
                    PrivateKey.asymmetricKeyType !== 'ec' ||
                    PublicKey.asymmetricKeyType !== 'ec'
                ) { throw new Error('you must provide a valid ECDSA key for alg: ES256, ES384 and ES512'); }
                break;
            }
            default: throw new Error('the algorithm is not supported or not provided');
        }
    }
    /**
     * generate a new Json Web Token
     * @param body the body of the Json Web Token
     * @returns the Json Web Token
     * @throws an error if the body is empty
     * @throws an error if the body is not a object
     */
    public generate(body: object): string {
        if (!body || typeof body !== 'object') throw new Error('the body must be a object');
        const BodyB64 = JsonWT.base64UrlEncode(JSON.stringify(body));
        const Signature = this.sign(BodyB64);
        return `${this.headB64}.${BodyB64}.${Signature}`;
    }
    /**
     * get the content of a Json Web Token
     * @param jwt the Json Web Token
     * @returns the content of the Json Web Token
     */
    public getContent(jwt: string): JsonWT.Content {
        const verify = this.verify(jwt);
        try {
            if (!verify) throw new Error('the Json Web Token is invalid');
            const [HeadB64, BodyB64, signature] = jwt.split('.');
            const decodedHead = JsonWT.base64UrlDecode(HeadB64);
            const decodedBody = JsonWT.base64UrlDecode(BodyB64);
            const head: JsonWT.Object = JSON.parse(decodedHead);
            const body: JsonWT.Object = JSON.parse(decodedBody);
            return { head, body, signature };
        } catch(error) {
            throw new Error('the Json Web Token is invalid');
        }
    }
    /**
     * create a signature for a Json Web Token
     * @param bodyB64 the body of the Json Web Token
     * @returns the signature of the Json Web Token
     */
    public sign(bodyB64: string, headB64: string = this.headB64): string  {
        const toSign = `${headB64}.${bodyB64}`;
        let signature = '';
        switch(this.signatory.algorithm) {
            case 'HMAC': {
                const hmac = CRYPTO.createHmac(this.signatory.hash, this.secret);
                hmac.update(toSign)
                signature = hmac.digest('base64url');
                break;
            }
            case 'RSA': {
                const signatureBuffer = CRYPTO.sign(this.signatory.hash, Buffer.from(toSign), {
                    key: this.privKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING
                });
                signature = signatureBuffer.toString('base64url');
                break;
            }
            case 'RSA-PSS': {
                const signatureBuffer = CRYPTO.sign(this.signatory.hash, Buffer.from(toSign), {
                    key: this.privKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                });
                signature = signatureBuffer.toString('base64url');
                break;
            }
            case 'ECDSA': {
                const signatureBuffer = CRYPTO.sign(this.signatory.hash, Buffer.from(toSign), {
                    key: this.privKey,
                    dsaEncoding: 'ieee-p1363'
                });
                signature = signatureBuffer.toString('base64url');
                break;
            }
            default: throw new Error('the algorithm is not supported or not provided');
        }
        return signature;
    }
    /**
     * verify a Json Web Token
     * @param jwt the Json Web Token
     * @returns true if the Json Web Token is valid
     * @throws an error if the Json Web Token is invalid
     * @throws an error if the Json Web Token is not a string
     */
    public verify(jwt: string): boolean {
        const [headB64, bodyB64, signature] = jwt.split('.');
        let verify = false;
        switch(this.signatory.algorithm) {
            case 'HMAC': {
                const NewSignature = this.sign(bodyB64, headB64);
                verify = signature === NewSignature ? true : false;
                break;
            }
            case 'RSA': {
                const ToVerify = `${headB64}.${bodyB64}`;
                verify = CRYPTO.verify(this.signatory.hash, Buffer.from(ToVerify), {
                    key: this.pubKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING,
                }, Buffer.from(signature, 'base64url'));
                break;
            }
            case 'RSA-PSS': {
                const ToVerify = `${headB64}.${bodyB64}`;
                verify = CRYPTO.verify(this.signatory.hash, Buffer.from(ToVerify), {
                    key: this.pubKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                }, Buffer.from(signature, 'base64url'));
                break;
            }
            case 'ECDSA': {
                const ToVerify = `${headB64}.${bodyB64}`;
                verify = CRYPTO.verify(this.signatory.hash, Buffer.from(ToVerify), {
                    key: this.pubKey,
                    dsaEncoding: 'ieee-p1363'
                }, Buffer.from(signature, 'base64url'));
                break;
            }
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
        return verify;
    }
    /**
     * extract the algorithm abd sign from the Json Web Token
     * @returns the algorithm and sign of the Json Web Token
     * @private 
     */
    private getSignInfo(): JsonWT.Signatory.info  {
        const nomAlgorithm = this.algorithm.slice(0,2);
        const nomHash = this.algorithm.slice(2,5);
        let algorithm: JsonWT.Signatory.algorithm;
        let hash: JsonWT.Signatory.hash;
        switch(nomAlgorithm) {
            case 'HS': algorithm = 'HMAC';     break;
            case 'RS': algorithm = 'RSA';      break;
            case 'ES': algorithm = 'ECDSA';    break;
            case 'PS': algorithm = 'RSA-PSS';  break;
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
        switch(nomHash) {
            case '256': hash = 'SHA256'; break;
            case '384': hash = 'SHA384'; break;
            case '512': hash = 'SHA512'; break;
            default: throw new Error('Se especifico un algoritmo invalido o no soportado')
        }
        return { algorithm: algorithm, hash: hash };
    }
    /**
     * encode to base64url
     * @param data the data to encode
     * @returns the encoded data
     * @private
     */
    private static base64UrlEncode(data: string): string {
        return Buffer.from(data).toString('base64url');
    }
    /**
     * decode from base64url
     * @param data the data to decode
     * @returns the decoded data
     * @private
     */
    private static base64UrlDecode(data: string): string {
        return Buffer.from(data, 'base64url').toString('utf8');
    }
    /**
     * get info about a public key
     * @param pubKey the public key
     * @returns the info of the public key
     * @private
     */
    private static getPublicKeyInfo(pubKey: string): CRYPTO.KeyObject {
        const info = CRYPTO.createPublicKey({
            key: pubKey, format: 'pem', type: 'spki'
        });
        return info;
    }
    /**
     * get info about a private key
     * @param privKey the private key
     * @returns the info of the private key
     * @private
     */
    private static getPrivateKey(privKey: string): CRYPTO.KeyObject {
        const privateKey = CRYPTO.createPrivateKey({
            key: privKey, format: 'pem', type: 'pkcs8'
        });
        return privateKey;
    }
}

export namespace JsonWT {
    export namespace Algorithm {
        export type HS = 'HS256' | 'HS384' | 'HS512';
        export type RS = 'RS256' | 'RS384' | 'RS512';
        export type ES = 'ES256' | 'ES384' | 'ES512';
        export type PS = 'PS256' | 'PS384' | 'PS512';
    }
    export namespace Signatory {
        export type algorithm = 'HMAC' | 'RSA' | 'ECDSA' | 'RSA-PSS';
        export type hash = 'SHA256' | 'SHA384' | 'SHA512';
        export type info = {
            algorithm: algorithm,
            hash: hash
        };
    }
    export interface Content {
        head: Object;
        body: Object;
        signature: string;
    }
    export interface Object {
        [key: string]: any;
    }
    export type Algorithm = Algorithm.ES | Algorithm.HS | Algorithm.PS | Algorithm.RS;
    export type options = {
        algorithm: Algorithm.HS,
        secret: string
    } | {
        algorithm: Algorithm.RS | Algorithm.PS | Algorithm.ES,
        privKey: string,
        pubKey: string
    }
}

export default JsonWT;