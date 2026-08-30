import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import modelLogin from "../models/model.login.js";
import { JWT_SECRET } from "../config/config.js";

function Logar(request, response) {
    let { usuario, senha } = request.body;

    if (!usuario || !senha) {
        return response.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    modelLogin.BuscarPorUsuario(usuario, function (err, result) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao consultar usuário' });
        }

        if (result.length === 0) {
            return response.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const usuarioEncontrado = result[0];

        bcrypt.compare(senha, usuarioEncontrado.senha, function (errBcrypt, senhaCorreta) {
            if (errBcrypt) {
                return response.status(500).json({ error: 'Erro ao verificar senha' });
            }

            if (!senhaCorreta) {
                return response.status(401).json({ error: 'Usuário ou senha inválidos' });
            }

            const token = jwt.sign(
                {
                    id: usuarioEncontrado.id,
                    usuario: usuarioEncontrado.usuario,
                    nivel_acesso: usuarioEncontrado.nivel_acesso
                },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            response.status(200).json({
                token,
                usuario: {
                    id: usuarioEncontrado.id,
                    nome: usuarioEncontrado.nome,
                    usuario: usuarioEncontrado.usuario,
                    email: usuarioEncontrado.email,
                    nivel_acesso: usuarioEncontrado.nivel_acesso
                }
            });
        });
    });
}

export default { Logar };