import bcrypt from 'bcryptjs';
import modelUsuarios from "../models/model.usuarios.js";

function CriarUsuario(request, response) {
    let { nome, usuario, senha, email, nivel_acesso } = request.body;

    if (!nome || !usuario || !senha) {
        return response.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
    }

    bcrypt.hash(senha, 10, function (errHash, hash) {
        if (errHash) {
            return response.status(500).json({ error: 'Erro ao processar senha' });
        }

        const dados = {
            nome,
            usuario,
            senha: hash,
            email: email || null,
            nivel_acesso: nivel_acesso || 'operador'
        };

        modelUsuarios.CriarUsuario(dados, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return response.status(409).json({ error: 'Já existe um usuário com esse nome de login' });
                }
                return response.status(500).json({ error: 'Erro ao criar usuário' });
            }
            response.status(201).json({ id: result.insertId, nome, usuario, email, nivel_acesso: dados.nivel_acesso });
        });
    });
}

function ListarUsuarios(request, response) {
    modelUsuarios.ListarUsuarios(function (err, result) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao listar usuários' });
        }
        response.status(200).json(result);
    });
}

function AlternarAtivoUsuario(request, response) {
    const { id } = request.params;
    const { ativo } = request.body;

    modelUsuarios.AlternarAtivoUsuario(id, ativo, function (err, result) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
        response.status(200).json({ sucesso: true });
    });
}

export default { CriarUsuario, ListarUsuarios, AlternarAtivoUsuario };