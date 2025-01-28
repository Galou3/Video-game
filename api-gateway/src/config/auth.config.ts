import path from 'path';
import fs from 'fs';

const publicKeyPath = path.join(__dirname, '../secrets/jwtRS256.key.pub');
const PUB_KEY = fs.readFileSync(publicKeyPath, 'utf8');


export { PUB_KEY }
