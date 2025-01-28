import path from 'path';
import fs from 'fs';

const publicKeyPath = path.join(__dirname, '../secrets/jwtRS256.key.pub');
const PUB_KEY = fs.readFileSync(publicKeyPath, 'utf8');

const privateKeyPath = path.join(__dirname, '../secrets/jwtRS256.key');
const PRIV_KEY = fs.readFileSync(privateKeyPath, 'utf8');

const jwtExpiration = 3600;
const jwtRefreshExpiration = 86400;


export { jwtExpiration, jwtRefreshExpiration, PUB_KEY, PRIV_KEY, }
