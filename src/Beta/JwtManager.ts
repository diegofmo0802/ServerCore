/**
 * @author diegofmo0802 <diegofmo0802@mysaml.com>
 * @description add the json web token manager to the server core.
 * @license Apache-2.0
 */

import Utilities from "../Utilities/Utilities.js";

import CRYPTO from 'crypto';

export class JwtManager {
    private static validSignMethods: JwtManager.jwtSignMethods[] = ['HS', 'RS', 'PS', 'ES'];
    private static validMaskMethods: JwtManager.jwtMaskMethods[] = ['256', '384', '512'];
    private static signMethodMap: JwtManager.signMethodMap = {
        HS: 'HMAC', RS: 'RSA', PS: 'RSA-PSS', ES: 'ECDSA'
    };
    private static maskMethodMap: JwtManager.maskMethodMap = {
        '256': 'SHA256', '384': 'SHA384', '512': 'SHA512'
    };
    private algorithm: JwtManager.jwtAlgorithms;
    private signMethod: JwtManager.signMethods;
    private maskMethod: JwtManager.maskMethods;
    private privKey: string;
    private pubKey: string | null;
    /**
     * create a new jwt manager
     * @param algorithm the algorithm to use
     * @param key the private key or secret to use
     * @throws an error if the algorithm is not valid
     * @throws an error if the key/secret is not valid
     */
    public constructor(algorithm: JwtManager.jwtAlgorithms, key: string) {
        const { signMethod, maskMethod } = JwtManager.getAlgorithmInfo(algorithm);
        if (!signMethod || !maskMethod) throw new Error('the jwt algorithm method is not valid')
        if (!JwtManager.validateKey('private',signMethod, key, true)) throw new Error('the key/secret is not valid');
        this.algorithm = algorithm;
        this.signMethod = signMethod;
        this.maskMethod = maskMethod;
        this.privKey = key;
        this.pubKey = signMethod === 'HMAC' ? null : JwtManager.getPubKey(key);
    }
    /**
     * sign a jwt
     * @param body the body of the jwt
     * @param options the options to sign the jwt
     * @returns the signed jwt
     */
    public sign(body: JwtManager.body, options: JwtManager.signOptions = {}): string {
        return JwtManager.sign(body, this.algorithm, this.privKey, options);
    }
    /**
     * verify a jwt
     * @param jwt the jwt to verify
     * @param options the options to verify the jwt
     * @returns the verified jwt
     */
    public parse(jwt: string, options: JwtManager.verifyOptions = {}): JwtManager.jwtObject {
        return JwtManager.parse(jwt, this.pubKey ?? this.privKey, options);
    }

    /**
     * sign a jwt
     * @param body the body of the jwt
     * @param options the options to sign the jwt
     * @returns the signed jwt
     * @throws an error if the algorithm is not valid
     * @throws an error if the key/secret is not valid
     */
    public static sign(body: JwtManager.body, algorithm: JwtManager.jwtAlgorithms, privKey: string, options: JwtManager.signOptions): string {
        const { signMethod, maskMethod } = JwtManager.getAlgorithmInfo(algorithm);
        if (!signMethod || !maskMethod) throw new Error('the jwt algorithm is not valid');
        if (!JwtManager.validateKey('private', signMethod, privKey)) throw new Error('the key/secret is not valid');
        const head = {
            alg: algorithm,
            typ: 'JWT',
            ...options
        };
        const b64Body = Utilities.base64UrlEncode(JSON.stringify(body));
        const b64Head = Utilities.base64UrlEncode(JSON.stringify(head));
        const toSign = `${b64Head}.${b64Body}`;
        switch(signMethod) {
            case 'HMAC': {
                const hmac = CRYPTO.createHmac(maskMethod, privKey);
                hmac.update(toSign)
                return toSign + '.' + hmac.digest('base64url');
            } case 'RSA': {
                const signatureBuffer = CRYPTO.sign(maskMethod, Buffer.from(toSign), {
                    key: privKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING
                });
                return toSign + '.' + signatureBuffer.toString('base64url');
            } case 'RSA-PSS': {
                const signatureBuffer = CRYPTO.sign(maskMethod, Buffer.from(toSign), {
                    key: privKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                });
                return toSign + '.' + signatureBuffer.toString('base64url');
            } case 'ECDSA': {
                const signatureBuffer = CRYPTO.sign(maskMethod, Buffer.from(toSign), {
                    key: privKey,
                    dsaEncoding: 'ieee-p1363'
                });
                return toSign + '.' +  signatureBuffer.toString('base64url');
            } default: { throw new Error('the sign method is not valid'); }
        }
    }
    /**
     * verify a jwt
     * @param jwt the jwt to verify
     * @param options the options to verify the jwt
     * @returns the verified jwt
     * @throws an error if the algorithm is not valid
     * @throws an error if the key/secret is not valid
     */
    public static parse(jwt: string, pubKey: string, options: JwtManager.verifyOptions = {}): JwtManager.jwtObject {
        const [b64Head, b64Body, signature] = jwt.split('.');
        const head = JSON.parse(Utilities.base64UrlDecode(b64Head)) as JwtManager.head;
        const body = JSON.parse(Utilities.base64UrlDecode(b64Body)) as JwtManager.body;
        const { signMethod, maskMethod } = JwtManager.getAlgorithmInfo(head.alg);
        if (!signMethod || !maskMethod) throw new Error('the jwt algorithm is not valid');
        if (!JwtManager.validateKey('public', signMethod, pubKey)) throw new Error('the key/secret is not valid');
        const toVerify = `${b64Head}.${b64Body}`;
        const result: JwtManager.jwtObject = {
            body: body, head: head,
            signature: signature, verify: false
        };
        switch(signMethod) {
            case 'HMAC': {
                const hmac = CRYPTO.createHmac(maskMethod, pubKey);
                hmac.update(toVerify)
                result.verify = hmac.digest('base64url') === signature;
                break;
            } case 'RSA': {
                result.verify = CRYPTO.verify(maskMethod, Buffer.from(toVerify), {
                    key: pubKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PADDING,
                }, Buffer.from(signature, 'base64url'));
                break
            } case 'RSA-PSS': {
                result.verify = CRYPTO.verify(maskMethod, Buffer.from(toVerify), {
                    key: pubKey,
                    padding: CRYPTO.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: CRYPTO.constants.RSA_PSS_SALTLEN_DIGEST
                }, Buffer.from(signature, 'base64url'));
                break
            } case 'ECDSA': {
                result.verify = CRYPTO.verify(maskMethod, Buffer.from(toVerify), {
                    key: pubKey,
                    dsaEncoding: 'ieee-p1363'
                }, Buffer.from(signature, 'base64url'));
                break
            } default: { throw new Error('the sign method is not valid'); }
        }
        return result;
    }
        
    /**
     * validate an private key
     * @param signMethod the sign method
     * @param key the private key
     * @param sendThrows whether to throw an error if the private key is invalid
     * @returns true if the private key is valid
     * @throws an error if the private key is invalid
     */
    private static validateKey(type: 'public' | 'private' = 'private', signMethod: JwtManager.signMethods, key: string, sendThrows: boolean = false): boolean {
        switch(signMethod) {
            case 'HMAC': {
                if (key.length < 6) {
                    if (sendThrows) throw new Error('the secret must be at least 6 characters');
                    else return false;
                } else return true;
            } case 'RSA': {
                const keyObject = type == 'public' ? CRYPTO.createPublicKey({ key }) : CRYPTO.createPrivateKey({ key });
                if (
                    keyObject.asymmetricKeyType !== 'rsa'
                    || keyObject.type !== type
                ) {
                    if (sendThrows) throw new Error('the key must be a valid RSA key');
                    else return false;
                } else return true
            } case 'RSA-PSS': {
                const keyObject = type == 'public' ? CRYPTO.createPublicKey({ key }) : CRYPTO.createPrivateKey({ key });
                if (
                    keyObject.asymmetricKeyType !== 'rsa-pss'
                    || keyObject.type !== type
                ) {
                    if (sendThrows) throw new Error('the key must be a valid RSA-PSS key');
                    else return false;
                } else return true
            } case 'ECDSA': {
                const keyObject = type == 'public' ? CRYPTO.createPublicKey({ key }) : CRYPTO.createPrivateKey({ key });
                if (
                    keyObject.asymmetricKeyType !== 'ec'
                    || keyObject.type !== type

                ) {
                    if (sendThrows) throw new Error('the key must be a valid ECDSA key');
                    else return false;
                } else return true
            } default: {
                if (sendThrows) throw new Error('the sign method is not valid');
                else return false;
            }
        }
    }
    private static getPubKey(privKey: string): string {
        const keyObject = CRYPTO.createPublicKey(privKey.replace(/\\n/g, '\n'));
        return keyObject.export({ format: 'pem', type: 'spki'}).toString();
    }
    private static getAlgorithmInfo(algorithm: JwtManager.jwtAlgorithms): JwtManager.algorithmInfo {
        const signMethod = algorithm.slice(0,2) as JwtManager.jwtSignMethods;
        const maskMethod = algorithm.slice(2,5) as JwtManager.jwtMaskMethods;
        return {
            signMethod: JwtManager.signMethodMap[signMethod],
            maskMethod: JwtManager.maskMethodMap[maskMethod]
        }
    }
}

export namespace JwtManager {
    export type signMethods = 'HMAC' | 'RSA' | 'ECDSA' | 'RSA-PSS';
    export type maskMethods = 'SHA256' | 'SHA384' | 'SHA512';
    export type jwtSignMethods = 'HS' | 'RS' | 'PS' | 'ES';
    export type jwtMaskMethods = '256' | '384' | '512';
    export type jwtAlgorithms = `${jwtSignMethods}${jwtMaskMethods}`
    export interface signMethodMap {
        HS: 'HMAC';
        RS: 'RSA';
        PS: 'RSA-PSS';
        ES: 'ECDSA';
    }
    export interface maskMethodMap {
        '256': 'SHA256';
        '384': 'SHA384';
        '512': 'SHA512';
    }
    export interface algorithmInfo {
        signMethod?: signMethods;
        maskMethod?: maskMethods;
    }
    export interface headers {
        exp?: number;
        [key: string]: any | undefined;
    }
    export interface head extends headers {
        alg: jwtAlgorithms;
        typ: 'JWT';
    }
    export interface body {
        [key: string]: any | undefined;
    }
    export interface jwtObject {
        body: body;
        head: head;
        signature: string;
        verify: boolean,
    }
    export interface verifyOptions {
        expire?: boolean
    }
    export interface signOptions {
        expire?: Date;
        [key: string]: any | undefined;
    }
}

export default JwtManager;   