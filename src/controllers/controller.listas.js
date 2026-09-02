import modelListas from "../models/model.listas.js";

const RECURSOS_PERMITIDOS = {
    'tipos-franquia': 'tipos_franquia',
    'funcoes': 'funcoes',
};

function Listar(request, response) {
    const { recurso } = request.params;
    const tabela = RECURSOS_PERMITIDOS[recurso];

    if (!tabela) {
        return response.status(400).json({ error: 'Recurso inválido' });
    }

    const incluirInativos = request.query.todos === 'true';

    modelListas.Listar(tabela, incluirInativos, function (err, itens) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar itens' });
        }
        response.status(200).json(itens);
    });
}

function Criar(request, response) {
    const { recurso } = request.params;
    const tabela = RECURSOS_PERMITIDOS[recurso];
    const { nome } = request.body;

    if (!tabela) {
        return response.status(400).json({ error: 'Recurso inválido' });
    }
    if (!nome || !nome.trim()) {
        return response.status(400).json({ error: 'Nome é obrigatório' });
    }

    modelListas.Criar(tabela, nome.trim(), function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ error: 'Já existe um item com esse nome' });
            }
            return response.status(500).json({ error: 'Erro ao criar item' });
        }
        response.status(201).json({ id: result.insertId, nome: nome.trim(), ativo: true });
    });
}

function AlternarAtivo(request, response) {
    const { recurso, id } = request.params;
    const tabela = RECURSOS_PERMITIDOS[recurso];
    const { ativo } = request.body;

    if (!tabela) {
        return response.status(400).json({ error: 'Recurso inválido' });
    }

    modelListas.AlternarAtivo(tabela, id, ativo, function (err) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao atualizar item' });
        }
        response.status(200).json({ sucesso: true });
    });
}

export default { Listar, Criar, AlternarAtivo };