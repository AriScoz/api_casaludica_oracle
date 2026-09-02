import modelFornecedores from "../models/model.fornecedores.js";

const CAMPOS_PERMITIDOS = [
    'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual', 'inscricao_municipal',
    'telefone', 'linha_produtos', 'grupo', 'regiao', 'uf', 'cidade', 'bairro',
    'endereco', 'numero', 'complemento', 'cep', 'taxa_rebate', 'observacoes'
];

function filtrarCamposPermitidos(body) {
    let dados = {};
    for (let campo of CAMPOS_PERMITIDOS) {
        if (body[campo] !== undefined && body[campo] !== '') {
            dados[campo] = body[campo];
        }
    }
    return dados;
}

function ListarFornecedores(request, response) {
    let pagina = parseInt(request.query.pagina) || 1;
    let limite = parseInt(request.query.limite) || 20;
    let filtros = {
        busca: request.query.busca || null,
        grupo: request.query.grupo || null,
        regiao: request.query.regiao || null,
        produtos: request.query.produtos || null,
        cnpj: request.query.cnpj || null,
        status: request.query.status || null,
    };

    modelFornecedores.ListarFornecedores(pagina, limite, filtros, function (err, fornecedores) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar fornecedores' });
        }

        modelFornecedores.ContarFornecedores(filtros, function (errCount, total) {
            if (errCount) {
                return response.status(500).json({ error: 'Erro ao contar fornecedores' });
            }

            response.status(200).json({
                fornecedores,
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas: Math.ceil(total / limite)
                }
            });
        });
    });
}

function CriarFornecedor(request, response) {
    const dados = filtrarCamposPermitidos(request.body);

    if (!dados.nome_fantasia) {
        return response.status(400).json({ error: 'Nome fantasia é obrigatório' });
    }

    modelFornecedores.ObterProximoCodigo(function (errCodigo, codigo) {
        if (errCodigo) {
            return response.status(500).json({ error: 'Erro ao gerar código' });
        }

        dados.codigo = codigo;
        dados.criado_por = request.usuario.id;

        modelFornecedores.CriarFornecedor(dados, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return response.status(409).json({ error: 'Já existe um fornecedor com esse CNPJ' });
                }
                return response.status(500).json({ error: 'Erro ao criar fornecedor' });
            }
            response.status(201).json({ id: result.insertId, codigo });
        });
    });
}

function ObterFornecedor(request, response) {
    const { id } = request.params;

    modelFornecedores.ObterFornecedorPorId(id, function (err, fornecedor) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar fornecedor' });
        }
        if (!fornecedor) {
            return response.status(404).json({ error: 'Fornecedor não encontrado' });
        }
        response.status(200).json(fornecedor);
    });
}

function AtualizarFornecedor(request, response) {
    const { id } = request.params;
    const dados = filtrarCamposPermitidos(request.body);

    if (Object.keys(dados).length === 0) {
        return response.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    modelFornecedores.AtualizarFornecedor(id, dados, function (err) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ error: 'Já existe um fornecedor com esse CNPJ' });
            }
            return response.status(500).json({ error: 'Erro ao atualizar fornecedor' });
        }
        response.status(200).json({ sucesso: true });
    });
}

function AlternarStatusFornecedor(request, response) {
    const { id } = request.params;
    const { status } = request.body;

    if (!['ativo', 'inativo'].includes(status)) {
        return response.status(400).json({ error: 'Status inválido' });
    }

    modelFornecedores.AlternarStatusFornecedor(id, status, function (err) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao atualizar status' });
        }
        response.status(200).json({ sucesso: true });
    });
}

export default { ListarFornecedores, CriarFornecedor, ObterFornecedor, AtualizarFornecedor, AlternarStatusFornecedor };