export function verifyAdmin(request, response, next) {
    if (!request.usuario || request.usuario.nivel_acesso !== 'admin') {
        return response.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
}