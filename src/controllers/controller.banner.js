import { randomUUID } from "crypto";
import { bucket } from "../config/firebase.js";
import modelBanner from "../models/model.banner.js";

const TELAS_PERMITIDAS = ['home', 'franquias', 'fornecedores', 'colaboradores', 'aniversariantes', 'calendario'];

function ObterBanner(request, response) {
    const { tela } = request.params;

    if (!TELAS_PERMITIDAS.includes(tela)) {
        return response.status(400).json({ error: 'Tela inválida' });
    }

    modelBanner.ObterBanner(tela, function (err, url) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao buscar banner' });
        }
        response.status(200).json({ url });
    });
}

function UploadBanner(request, response) {
    const { tela } = request.params;

    if (!TELAS_PERMITIDAS.includes(tela)) {
        return response.status(400).json({ error: 'Tela inválida' });
    }

    if (!request.file) {
        return response.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const extensao = request.file.originalname.split('.').pop();
    const nomeArquivo = `banners/banner-${tela}-${randomUUID()}.${extensao}`;
    const arquivo = bucket.file(nomeArquivo);

    const stream = arquivo.createWriteStream({
        metadata: { contentType: request.file.mimetype }
    });

    stream.on('error', () => {
        response.status(500).json({ error: 'Erro ao enviar imagem' });
    });

    stream.on('finish', async () => {
        try {
            await arquivo.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;

            modelBanner.SalvarBanner(tela, url, function (err) {
                if (err) {
                    return response.status(500).json({ error: 'Erro ao salvar referência do banner' });
                }
                response.status(200).json({ url });
            });
        } catch (err) {
            response.status(500).json({ error: 'Erro ao tornar imagem pública' });
        }
    });

    stream.end(request.file.buffer);
}

export default { ObterBanner, UploadBanner };