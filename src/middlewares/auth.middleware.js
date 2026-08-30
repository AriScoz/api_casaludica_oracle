import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

export function verifyToken(request, response, next) {
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return response.status(403).json({ error: 'Token inválido ou expirado' });
        }
        request.usuario = decoded;
        next();
    });
}