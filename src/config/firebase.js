import { cert, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../../firebase-service-account.json'), 'utf-8')
);

const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'franqueadora-ce93d.appspot.com'
});

const bucket = getStorage(app).bucket();

export { bucket };