import {db} from "../config/database.js";

function montarFiltros(filtros) {
    let condicoes = [];
    let parametros = [];

    if (filtros.busca) {
        condicoes.push("(c.nome LIKE ? OR c.cpf LIKE ?)");
        parametros.push(`%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    if (filtros.funcao_id) {
        condicoes.push("c.funcao_id = ?");
        parametros.push(filtros.funcao_id);
    }
    if (filtros.status) {
        condicoes.push("c.status = ?");
        parametros.push(filtros.status);
    }

    let whereClause = condicoes.length > 0 ? "WHERE " + condicoes.join(" AND ") : "";
    return { whereClause, parametros };
}

function ListarColaboradores(pagina, limite, filtros, callback) {
    let offset = (pagina - 1) * limite;
    let { whereClause, parametros } = montarFiltros(filtros);

    let ssql = `
        SELECT c.id, c.codigo, c.nome, c.cpf, c.telefone, c.status, f.nome AS funcao
        FROM colaboradores c
        LEFT JOIN funcoes f ON f.id = c.funcao_id
        ${whereClause}
        ORDER BY c.codigo DESC
        LIMIT ? OFFSET ?
    `;
    let parametrosFinal = [...parametros, limite, offset];

    db.query(ssql, parametrosFinal, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ContarColaboradores(filtros, callback) {
    let { whereClause, parametros } = montarFiltros(filtros);
    let ssql = `SELECT COUNT(*) as total FROM colaboradores c ${whereClause}`;

    db.query(ssql, parametros, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result[0].total);
        }
    });
}

function ObterProximoCodigo(callback) {
    db.getConnection((err, connection) => {
        if (err) return callback(err);

        connection.query(
            "UPDATE contadores SET valor = LAST_INSERT_ID(valor + 1) WHERE nome = 'colaboradores'",
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

function CriarColaborador(dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let placeholders = campos.map(() => '?').join(', ');

    let ssql = `INSERT INTO colaboradores (${campos.join(', ')}) VALUES (${placeholders})`;

    db.query(ssql, valores, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ObterColaboradorPorId(id, callback) {
    let ssql = "SELECT * FROM colaboradores WHERE id = ?";
    db.query(ssql, [id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result.length > 0 ? result[0] : null);
        }
    });
}

function AtualizarColaborador(id, dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let setClause = campos.map(c => `${c} = ?`).join(', ');

    let ssql = `UPDATE colaboradores SET ${setClause} WHERE id = ?`;

    db.query(ssql, [...valores, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function AlternarStatusColaborador(id, status, callback) {
    let ssql = "UPDATE colaboradores SET status = ? WHERE id = ?";
    db.query(ssql, [status, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function AtualizarFotoColaborador(id, url, callback) {
    let ssql = "UPDATE colaboradores SET foto_url = ? WHERE id = ?";
    db.query(ssql, [url, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ListarAniversariantes(mes, callback) {
    let ssql = `
        SELECT nome, DAY(data_nascimento) as dia
        FROM colaboradores
        WHERE MONTH(data_nascimento) = ? AND status = 'ativo'
        ORDER BY dia ASC
    `;
    db.query(ssql, [mes], function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}
export default {
    ListarColaboradores, ContarColaboradores, ObterProximoCodigo, CriarColaborador,
    ObterColaboradorPorId, AtualizarColaborador, AlternarStatusColaborador, AtualizarFotoColaborador, ListarAniversariantes
};