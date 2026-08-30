import { db } from "../config/database.js";

function montarFiltros(filtros) {
    let condicoes = [];
    let parametros = [];

    if (filtros.busca) {
        condicoes.push("(f.nome_fantasia LIKE ? OR f.razao_social LIKE ? OR f.cnpj LIKE ?)");
        parametros.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    if (filtros.tipo_id) {
        condicoes.push("f.tipo_id = ?");
        parametros.push(filtros.tipo_id);
    }
    if (filtros.regiao) {
        condicoes.push("f.regiao = ?");
        parametros.push(filtros.regiao);
    }
    if (filtros.uf) {
        condicoes.push("f.uf = ?");
        parametros.push(filtros.uf);
    }
    if (filtros.status) {
        condicoes.push("f.status = ?");
        parametros.push(filtros.status);
    }
    if (filtros.cidades_abrangencia) {
        condicoes.push("f.cidades_abrangencia LIKE ?");
        parametros.push(`%${filtros.cidades_abrangencia}%`);
    }

    let whereClause = condicoes.length > 0 ? "WHERE " + condicoes.join(" AND ") : "";
    return { whereClause, parametros };
}

function ListarFranquias(pagina, limite, filtros, callback) {
    let offset = (pagina - 1) * limite;
    let { whereClause, parametros } = montarFiltros(filtros);

    let ssql = `
        SELECT f.id, f.codigo, f.nome_fantasia, f.razao_social, f.cnpj, f.status,
               f.regiao, f.uf, f.cidade, f.telefone, t.nome AS tipo
        FROM franquias f
        LEFT JOIN tipos_franquia t ON t.id = f.tipo_id
        ${whereClause}
       ORDER BY f.codigo DESC
        LIMIT ? OFFSET ?
    `;
    let parametrosFinal = [...parametros, limite, offset];

    db.query(ssql, parametrosFinal, function (err, result) {
        if (err) {
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ContarFranquias(filtros, callback) {
    let { whereClause, parametros } = montarFiltros(filtros);
    let ssql = `SELECT COUNT(*) as total FROM franquias f ${whereClause}`;

    db.query(ssql, parametros, function (err, result) {
        if (err) {
            callback(err, []);
        } else {
            callback(undefined, result[0].total);
        }
    });
}

function ListarTipos(callback) {
    let ssql = "SELECT id, nome FROM tipos_franquia WHERE ativo = TRUE ORDER BY nome";
    db.query(ssql, function (err, result) {
        if (err) {
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ObterProximoCodigo(callback) {
    db.getConnection((err, connection) => {
        if (err) return callback(err);

        connection.query(
            "UPDATE contadores SET valor = LAST_INSERT_ID(valor + 1) WHERE nome = 'franquias'",
            (err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                connection.query("SELECT LAST_INSERT_ID() as codigo", (err, result) => {
                    connection.release();
                    if (err) return callback(err);
                    callback(undefined, result[0].codigo);
                });
            }
        );
    });
}

function CriarFranquia(dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let placeholders = campos.map(() => '?').join(', ');

    let ssql = `INSERT INTO franquias (${campos.join(', ')}) VALUES (${placeholders})`;

    db.query(ssql, valores, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ObterFranquiaPorId(id, callback) {
    let ssql = "SELECT * FROM franquias WHERE id = ?";
    db.query(ssql, [id], function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(undefined, result.length > 0 ? result[0] : null);
        }
    });
}

function AtualizarFranquia(id, dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let setClause = campos.map(c => `${c} = ?`).join(', ');

    let ssql = `UPDATE franquias SET ${setClause} WHERE id = ?`;

    db.query(ssql, [...valores, id], function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function AlternarStatusFranquia(id, status, callback) {
    let ssql = "UPDATE franquias SET status = ? WHERE id = ?";
    db.query(ssql, [status, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { ListarFranquias, ContarFranquias, ListarTipos, ObterProximoCodigo, CriarFranquia, ObterFranquiaPorId, AtualizarFranquia, AlternarStatusFranquia };