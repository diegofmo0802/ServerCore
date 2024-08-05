import { JwtManager } from "../../build/Beta/JwtManager/JwtManager.js";

import CRYPTO from 'crypto';

const MASKS = ['256', '384', '512']
const SECRET = 'secret'
const { publicKey: RSA_PUB_KEY, privateKey: RSA_PRIV_KEY } = CRYPTO.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});
const { publicKey: PSS_PUB_KEY, privateKey: PSS_PRIV_KEY } = CRYPTO.generateKeyPairSync('rsa-pss', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});
const { publicKey: EC_PUB_KEY, privateKey: EC_PRIV_KEY } = CRYPTO.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

const body = {
    test: 'test',
    XD: "xd"
};

const options =  {
    expire: new Date(Date.now() + 10000)
};

for (let index = 0; index < 1; index++) {
    const jwt = new JwtManager('HS' + MASKS[index], SECRET);
    console.log('--------------------------')
    const JWTObject1 = jwt.sign(body, options);
    console.log('jwt:', JWTObject1);
    console.log('secret:', SECRET, '\n', jwt.verify(JWTObject1), '\n');
    console.log('RSA  ---------------------')
    const jwtRsa = new JwtManager('RS' + MASKS[index], RSA_PRIV_KEY);
    const JWTObject2 = jwtRsa.sign(body, options)
    console.log('jwt:', JWTObject2);
    console.log('Private Key:', RSA_PRIV_KEY);
    console.log('Public Key:', RSA_PUB_KEY);
    console.log(jwtRsa.verify(JWTObject2), '\n');
    console.log('PSS  ---------------------')
    const jwtPss = new JwtManager('PS' + MASKS[index], PSS_PRIV_KEY);
    jwtPss.sign(body, options)
    const JWTObject3 = jwtPss.sign(body, options)
    console.log('jwt:', JWTObject3);
    console.log('Private Key:', PSS_PRIV_KEY);
    console.log('Public Key:', PSS_PUB_KEY);
    console.log(jwtPss.verify(JWTObject3), '\n');
    console.log('ECDSA  -------------------')
    const jwtEc = new JwtManager('ES' + MASKS[index], EC_PRIV_KEY);
    const JWTObject4 = jwtEc.sign(body, options)
    console.log('jwt:', JWTObject4);
    console.log('Private Key:', EC_PRIV_KEY);
    console.log('Public Key:', EC_PUB_KEY);
    console.log(jwtEc.verify(JWTObject4), '\n');
}