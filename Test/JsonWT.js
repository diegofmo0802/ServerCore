import JsonWT from "../JsonWT/JsonWT.js";
import CRYPTO from 'crypto';
import FS from 'fs';

const JWT = new JsonWT({
    Algorithm: 'ES256',
    Key: FS.readFileSync('Test/private.pem').toString(),
    Public: FS.readFileSync('Test/public.pem').toString()
});
let my_jwt = JWT.Generate({
    name: 'XD', rol: 'adm'
});
console.log(my_jwt)
console.log(JWT.Verify(my_jwt));
console.log(JWT.GetContent(my_jwt));

/*
let X = CRYPTO.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
})
FS.writeFileSync('Test/Public.pem', X.publicKey);
FS.writeFileSync('Test/Private.pem', X.privateKey);
*/