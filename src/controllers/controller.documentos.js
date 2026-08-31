import { randomUUID } from "crypto";
import { bucket } from "../config/firebase.js";
import modelDocumentos from "../models/model.documentos.js";

const ENTIDADES_PERMITIDAS = ['franquia', 'colaborador', 'fornecedor'];

function UploadDocumento(request, response) {
    const { entidade_tipo, entidade_id, tipo_documento, visibilidade } = request.body;

    if (!ENTIDADES_PERMITIDAS.includes(entidade_tipo)) {
        return response.status(400).json({ error: 'Tipo de entidade inválido' });
    }
    if (!entidade_id || !tipo_documento) {
        return response.status(400).json({ error: 'Dados incompletos' });
    }
    if (!request.file) {
        return response.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const visibilidadeFinal = visibilidade === 'publico' ? 'publico' : 'privado';
    const extensao = request.file.originalname.split('.').pop();
    const caminhoStorage = `documentos/${entidade_tipo}/${entidade_id}/${randomUUID()}.${extensao}`;
    const arquivo = bucket.file(caminhoStorage);

    const stream = arquivo.createWriteStream({
        metadata: { contentType: request.file.mimetype }
    });

    stream.on('error', () => {
        response.status(500).json({ error: 'Erro ao enviar arquivo' });
    });

    stream.on('finish', async () => {
        try {
            let urlPublica = null;

            if (visibilidadeFinal === 'publico') {
                await arquivo.makePublic();
                urlPublica = `https://storage.googleapis.com/${bucket.name}/${caminhoStorage}`;
            }

            const dados = {
                entidade_tipo,
                entidade_id,
                tipo_documento,
                visibilidade: visibilidadeFinal,
                nome_original: request.file.originalname,
                caminho_storage: caminhoStorage,
                url_publica: urlPublica,
                mimetype: request.file.mimetype,
                tamanho: request.file.size,
                enviado_por: request.usuario.id
            };

            modelDocumentos.CriarDocumento(dados, function (err, result) {
                if (err) {
                    return response.status(500).json({ error: 'Erro ao salvar registro do documento' });
                }
                response.status(201).json({ id: result.insertId, ...dados });
            });
        } catch (err) {
            response.status(500).json({ error: 'Erro ao processar arquivo' });
        }
    });

    stream.end(request.file.buffer);
}

function ListarDocumentos(request, response) {
    const { entidade_tipo, entidade_id, tipo_documento } = request.query;

    if (!ENTIDADES_PERMITIDAS.includes(entidade_tipo) || !entidade_id) {
        return response.status(400).json({ error: 'Parâmetros inválidos' });
    }

    const podeVerPrivados = ['admin', 'gerente'].includes(request.usuario.nivel_acesso);

    modelDocumentos.ListarDocumentos(entidade_tipo, entidade_id, tipo_documento, function (err, documentos) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar documentos' });
        }

        const documentosFiltrados = podeVerPrivados
            ? documentos
            : documentos.filter(doc => doc.visibilidade === 'publico');

        response.status(200).json(documentosFiltrados);
    });
}

function BaixarDocumento(request, response) {
    const { id } = request.params;

    modelDocumentos.ObterDocumentoPorId(id, async function (err, documento) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar documento' });
        }
        if (!documento) {
            return response.status(404).json({ error: 'Documento não encontrado' });
        }

        if (documento.visibilidade === 'privado' && !['admin', 'gerente'].includes(request.usuario.nivel_acesso)) {
            return response.status(403).json({ error: 'Acesso restrito a administradores e gerentes' });
        }

        if (documento.visibilidade === 'publico') {
            return response.status(200).json({ url: documento.url_publica });
        }

        try {
            const arquivo = bucket.file(documento.caminho_storage);
            const [url] = await arquivo.getSignedUrl({
                action: 'read',
                expires: Date.now() + 5 * 60 * 1000
            });
            response.status(200).json({ url });
        } catch (errSigned) {
            response.status(500).json({ error: 'Erro ao gerar link de download' });
        }
    });
}

function ExcluirDocumento(request, response) {
    const { id } = request.params;

    modelDocumentos.ObterDocumentoPorId(id, async function (err, documento) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar documento' });
        }
        if (!documento) {
            return response.status(404).json({ error: 'Documento não encontrado' });
        }

        try {
            await bucket.file(documento.caminho_storage).delete();
        } catch (errDelete) {
            // Se o arquivo já não existir no Storage, seguimos e removemos do banco mesmo assim
        }

        modelDocumentos.ExcluirDocumento(id, function (errDb) {
            if (errDb) {
                return response.status(500).json({ error: 'Erro ao excluir registro' });
            }
            response.status(200).json({ sucesso: true });
        });
    });
}

export default { UploadDocumento, ListarDocumentos, BaixarDocumento, ExcluirDocumento };