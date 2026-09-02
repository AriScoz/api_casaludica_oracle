import {db} from "../config/database.js";

function Listar(tabela, incluirInativos, callback) {
    let ssql = incluirInativos
        ? `SELECT id, nome, ativo FROM ${tabela} ORDER BY nome`
        : `SELECT id, nome, ativo FROM ${tabela} WHERE ativo = TRUE ORDER BY nome`;

    db.query(ssql, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function Criar(tabela, nome, callback) {
    let ssql = `INSERT INTO ${tabela} (nome) VALUES (?)`;
    db.query(ssql, [nome], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function AlternarAtivo(tabela, id, ativo, callback) {
    let ssql = `UPDATE ${tabela} SET ativo = ? WHERE id = ?`;
    db.query(ssql, [ativo, id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { Listar, Criar, AlternarAtivo };