import {db} from "../config/database.js";

function CriarDocumento(dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let placeholders = campos.map(() => '?').join(', ');

    let ssql = `INSERT INTO documentos (${campos.join(', ')}) VALUES (${placeholders})`;

    db.query(ssql, valores, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ListarDocumentos(entidadeTipo, entidadeId, tipoDocumento, callback) {
    let condicoes = ["entidade_tipo = ?", "entidade_id = ?"];
    let parametros = [entidadeTipo, entidadeId];

    if (tipoDocumento) {
        condicoes.push("tipo_documento = ?");
        parametros.push(tipoDocumento);
    }

    let ssql = `
        SELECT id, tipo_documento, visibilidade, nome_original, url_publica, mimetype, tamanho, criado_em
        FROM documentos
        WHERE ${condicoes.join(' AND ')}
        ORDER BY criado_em DESC
    `;

    db.query(ssql, parametros, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ObterDocumentoPorId(id, callback) {
    let ssql = "SELECT * FROM documentos WHERE id = ?";
    db.query(ssql, [id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result.length > 0 ? result[0] : null);
        }
    });
}

function ExcluirDocumento(id, callback) {
    let ssql = "DELETE FROM documentos WHERE id = ?";
    db.query(ssql, [id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { CriarDocumento, ListarDocumentos, ObterDocumentoPorId, ExcluirDocumento };