import {db} from "../config/database.js";

function montarFiltros(filtros) {
    let condicoes = [];
    let parametros = [];

    if (filtros.busca) {
        condicoes.push("(nome_fantasia LIKE ? OR razao_social LIKE ? OR cnpj LIKE ?)");
        parametros.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    if (filtros.grupo) {
        condicoes.push("grupo = ?");
        parametros.push(filtros.grupo);
    }
    if (filtros.regiao) {
        condicoes.push("regiao = ?");
        parametros.push(filtros.regiao);
    }
    if (filtros.produtos) {
        condicoes.push("linha_produtos LIKE ?");
        parametros.push(`%${filtros.produtos}%`);
    }
    if (filtros.cnpj) {
        condicoes.push("cnpj LIKE ?");
        parametros.push(`%${filtros.cnpj}%`);
    }
    if (filtros.status) {
        condicoes.push("status = ?");
        parametros.push(filtros.status);
    }

    let whereClause = condicoes.length > 0 ? "WHERE " + condicoes.join(" AND ") : "";
    return { whereClause, parametros };
}

function ListarFornecedores(pagina, limite, filtros, callback) {
    let offset = (pagina - 1) * limite;
    let { whereClause, parametros } = montarFiltros(filtros);

    let ssql = `
        SELECT id, codigo, nome_fantasia, razao_social, cnpj, telefone, grupo, taxa_rebate, status
        FROM fornecedores
        ${whereClause}
        ORDER BY codigo DESC
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

function ContarFornecedores(filtros, callback) {
    let { whereClause, parametros } = montarFiltros(filtros);
    let ssql = `SELECT COUNT(*) as total FROM fornecedores ${whereClause}`;

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
            "UPDATE contadores SET valor = LAST_INSERT_ID(valor + 1) WHERE nome = 'fornecedores'",
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

function CriarFornecedor(dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let placeholders = campos.map(() => '?').join(', ');

    let ssql = `INSERT INTO fornecedores (${campos.join(', ')}) VALUES (${placeholders})`;

    db.query(ssql, valores, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ObterFornecedorPorId(id, callback) {
    let ssql = "SELECT * FROM fornecedores WHERE id = ?";
    db.query(ssql, [id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result.length > 0 ? result[0] : null);
        }
    });
}

function AtualizarFornecedor(id, dados, callback) {
    let campos = Object.keys(dados);
    let valores = Object.values(dados);
    let setClause = campos.map(c => `${c} = ?`).join(', ');

    let ssql = `UPDATE fornecedores SET ${setClause} WHERE id = ?`;

    db.query(ssql, [...valores, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function AlternarStatusFornecedor(id, status, callback) {
    let ssql = "UPDATE fornecedores SET status = ? WHERE id = ?";
    db.query(ssql, [status, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { ListarFornecedores, ContarFornecedores, ObterProximoCodigo, CriarFornecedor, ObterFornecedorPorId, AtualizarFornecedor, AlternarStatusFornecedor };