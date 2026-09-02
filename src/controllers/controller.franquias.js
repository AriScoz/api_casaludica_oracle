import modelFranquias from "../models/model.franquias.js";

function ListarFranquias(request, response) {
    let pagina = parseInt(request.query.pagina) || 1;
    let limite = parseInt(request.query.limite) || 20;
    let filtros = {
        busca: request.query.busca || null,
        tipo_id: request.query.tipo_id || null,
        regiao: request.query.regiao || null,
        uf: request.query.uf || null,
        status: request.query.status || null,
        cidades_abrangencia: request.query.cidades_abrangencia || null,
    };

    modelFranquias.ListarFranquias(pagina, limite, filtros, function (err, franquias) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar franquias' });
        }

        modelFranquias.ContarFranquias(filtros, function (errCount, total) {
            if (errCount) {
                return response.status(500).json({ error: 'Erro ao contar franquias' });
            }

            response.status(200).json({
                franquias,
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

function ListarTipos(request, response) {
    modelFranquias.ListarTipos(function (err, tipos) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar tipos' });
        }
        response.status(200).json(tipos);
    });
}

const CAMPOS_PERMITIDOS = [
    'nome_fantasia', 'razao_social', 'cnpj', 'tipo_id', 'status', 'regiao', 'uf',
    'cidade', 'bairro', 'endereco', 'numero', 'complemento', 'cep', 'telefone',
    'email_contato', 'inscricao_estadual', 'inscricao_municipal', 'nome_franqueados',
    'cidades_abrangencia', 'data_inauguracao', 'data_contrato', 'data_encerramento',
    'motivo_encerramento', 'data_aniversario_cidade', 'observacoes'
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

function CriarFranquia(request, response) {
    const dados = filtrarCamposPermitidos(request.body);

    if (!dados.nome_fantasia) {
        return response.status(400).json({ error: 'Nome fantasia é obrigatório' });
    }

    modelFranquias.ObterProximoCodigo(function (errCodigo, codigo) {
        if (errCodigo) {
            return response.status(500).json({ error: 'Erro ao gerar código' });
        }

        dados.codigo = codigo;
        dados.criado_por = request.usuario.id;

        modelFranquias.CriarFranquia(dados, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return response.status(409).json({ error: 'Já existe uma franquia com esse CNPJ' });
                }
                return response.status(500).json({ error: 'Erro ao criar franquia' });
            }
            response.status(201).json({ id: result.insertId, codigo });
        });
    });
}

function ObterFranquia(request, response) {
    const { id } = request.params;

    modelFranquias.ObterFranquiaPorId(id, function (err, franquia) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar franquia' });
        }
        if (!franquia) {
            return response.status(404).json({ error: 'Franquia não encontrada' });
        }
        response.status(200).json(franquia);
    });
}

function AtualizarFranquia(request, response) {
    const { id } = request.params;
    const dados = filtrarCamposPermitidos(request.body);

    if (Object.keys(dados).length === 0) {
        return response.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    modelFranquias.AtualizarFranquia(id, dados, function (err) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ error: 'Já existe uma franquia com esse CNPJ' });
            }
            return response.status(500).json({ error: 'Erro ao atualizar franquia' });
        }
        response.status(200).json({ sucesso: true });
    });
}

function AlternarStatusFranquia(request, response) {
    const { id } = request.params;
    const { status } = request.body;

    if (!['ativa', 'inativa'].includes(status)) {
        return response.status(400).json({ error: 'Status inválido' });
    }

    modelFranquias.AlternarStatusFranquia(id, status, function (err) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao atualizar status' });
        }
        response.status(200).json({ sucesso: true });
    });
}
function ListarAniversariantes(request, response) {
    const mes = parseInt(request.query.mes) || (new Date().getMonth() + 1);

    if (mes < 1 || mes > 12) {
        return response.status(400).json({ error: 'Mês inválido' });
    }

    modelFranquias.ListarAniversariantes(mes, function (err, franquias) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar aniversariantes' });
        }
        response.status(200).json(franquias);
    });
}
export default { ListarFranquias, ListarTipos, CriarFranquia, ObterFranquia, AtualizarFranquia, AlternarStatusFranquia, ListarAniversariantes };