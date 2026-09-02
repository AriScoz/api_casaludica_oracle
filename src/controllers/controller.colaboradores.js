import { randomUUID } from "crypto";
import { bucket } from "../config/firebase.js";
import modelColaboradores from "../models/model.colaboradores.js";

const CAMPOS_PERMITIDOS = [
    'nome', 'cpf', 'rg', 'data_nascimento', 'sexo', 'estado_civil', 'telefone',
    'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf', 'regiao', 'complemento',
    'funcao_id', 'data_admissao', 'data_saida', 'motivo_saida', 'observacoes'
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

function ListarColaboradores(request, response) {
    let pagina = parseInt(request.query.pagina) || 1;
    let limite = parseInt(request.query.limite) || 20;
    let filtros = {
        busca: request.query.busca || null,
        funcao_id: request.query.funcao_id || null,
        status: request.query.status || null,
    };

    modelColaboradores.ListarColaboradores(pagina, limite, filtros, function (err, colaboradores) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar colaboradores' });
        }

        modelColaboradores.ContarColaboradores(filtros, function (errCount, total) {
            if (errCount) {
                return response.status(500).json({ error: 'Erro ao contar colaboradores' });
            }

            response.status(200).json({
                colaboradores,
                paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) }
            });
        });
    });
}

function CriarColaborador(request, response) {
    const dados = filtrarCamposPermitidos(request.body);

    if (!dados.nome) {
        return response.status(400).json({ error: 'Nome é obrigatório' });
    }

    modelColaboradores.ObterProximoCodigo(function (errCodigo, codigo) {
        if (errCodigo) {
            return response.status(500).json({ error: 'Erro ao gerar código' });
        }

        dados.codigo = codigo;
        dados.criado_por = request.usuario.id;

        modelColaboradores.CriarColaborador(dados, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return response.status(409).json({ error: 'Já existe um colaborador com esse CPF' });
                }
                return response.status(500).json({ error: 'Erro ao criar colaborador' });
            }
            response.status(201).json({ id: result.insertId, codigo });
        });
    });
}

function ObterColaborador(request, response) {
    const { id } = request.params;

    modelColaboradores.ObterColaboradorPorId(id, function (err, colaborador) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar colaborador' });
        }
        if (!colaborador) {
            return response.status(404).json({ error: 'Colaborador não encontrado' });
        }
        response.status(200).json(colaborador);
    });
}

function AtualizarColaborador(request, response) {
    const { id } = request.params;
    const dados = filtrarCamposPermitidos(request.body);

    if (Object.keys(dados).length === 0) {
        return response.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    modelColaboradores.AtualizarColaborador(id, dados, function (err) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return response.status(409).json({ error: 'Já existe um colaborador com esse CPF' });
            }
            return response.status(500).json({ error: 'Erro ao atualizar colaborador' });
        }
        response.status(200).json({ sucesso: true });
    });
}

function AlternarStatusColaborador(request, response) {
    const { id } = request.params;
    const { status } = request.body;

    if (!['ativo', 'inativo'].includes(status)) {
        return response.status(400).json({ error: 'Status inválido' });
    }

    modelColaboradores.AlternarStatusColaborador(id, status, function (err) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao atualizar status' });
        }
        response.status(200).json({ sucesso: true });
    });
}

function UploadFoto(request, response) {
    const { id } = request.params;

    if (!request.file) {
        return response.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const extensao = request.file.originalname.split('.').pop();
    const caminhoStorage = `colaboradores/${id}/foto-${randomUUID()}.${extensao}`;
    const arquivo = bucket.file(caminhoStorage);

    const stream = arquivo.createWriteStream({
        metadata: { contentType: request.file.mimetype }
    });

    stream.on('error', () => {
        response.status(500).json({ error: 'Erro ao enviar imagem' });
    });

    stream.on('finish', async () => {
        try {
            await arquivo.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${caminhoStorage}`;

            modelColaboradores.AtualizarFotoColaborador(id, url, function (err) {
                if (err) {
                    return response.status(500).json({ error: 'Erro ao salvar referência da foto' });
                }
                response.status(200).json({ url });
            });
        } catch (err) {
            response.status(500).json({ error: 'Erro ao processar imagem' });
        }
    });

    stream.end(request.file.buffer);
}

export default {
    ListarColaboradores, CriarColaborador, ObterColaborador, AtualizarColaborador,
    AlternarStatusColaborador, UploadFoto
};