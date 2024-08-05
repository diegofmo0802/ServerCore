import { JwtManager } from "../../build/Beta/JwtManager/JwtManager.js";
import CRYPTO from 'crypto';
import Utilities from "../../build/Utilities.js";
import { strict as assert } from 'assert';

const MASKS = ['256', '384', '512'];
const SECRET = 'secret';

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

const options = {
    expire: new Date(Date.now() + 10000)
};

const testBase64UrlEncode = () => {
    assert.equal(Utilities.base64UrlEncode('hello world'), 'aGVsbG8gd29ybGQ');
    console.log('Utilities.base64UrlEncode passed');
};

const testBase64UrlDecode = () => {
    assert.equal(Utilities.base64UrlDecode('aGVsbG8gd29ybGQ'), 'hello world');
    console.log('Utilities.base64UrlDecode passed');
};

const testJwtManagerSignVerify = (algorithm, key, pubKey) => {
    const jwt = new JwtManager(algorithm, key);
    console.log('--------------------------')
    const JWTObject = jwt.sign(body, options);
    console.log('jwt:', JWTObject);
    if (algorithm.startsWith('HS')) {
        console.log('secret:', key);
    } else {
        console.log('Private Key:', key);
        if (pubKey) {
            console.log('Public Key:', pubKey);
        }
    }
    const verificationResult = jwt.verify(JWTObject);
    console.log(verificationResult, '\n');
    assert.equal(verificationResult.verify, true);
    assert.deepEqual(verificationResult.body, body);
    console.log(`${algorithm} test passed`);
};

const runTests = () => {
    try {
        testBase64UrlEncode();
        testBase64UrlDecode();

        for (let index = 0; index < MASKS.length; index++) {
            const algorithm = 'HS' + MASKS[index];
            testJwtManagerSignVerify(algorithm, SECRET);

            const algorithmRS = 'RS' + MASKS[index];
            testJwtManagerSignVerify(algorithmRS, RSA_PRIV_KEY, RSA_PUB_KEY);

            const algorithmPS = 'PS' + MASKS[index];
            testJwtManagerSignVerify(algorithmPS, PSS_PRIV_KEY, PSS_PUB_KEY);

            const algorithmES = 'ES' + MASKS[index];
            testJwtManagerSignVerify(algorithmES, EC_PRIV_KEY, EC_PUB_KEY);
        }

        console.log('All tests passed');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};


runTests();
