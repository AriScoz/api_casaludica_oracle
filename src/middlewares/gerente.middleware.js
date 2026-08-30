export function verifyGerenteOuAdmin(request, response, next) {
    if (!request.usuario || !['admin', 'gerente'].includes(request.usuario.nivel_acesso)) {
        return response.status(403).json({ error: 'Acesso restrito a administradores e gerentes' });
    }
    next();
}