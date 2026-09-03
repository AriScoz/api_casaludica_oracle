import {db} from "../config/database.js";

function ListarEventosDoMes(mes, callback) {
    let ssql = "SELECT id, titulo, descricao, DAY(data) as dia, tipo FROM eventos WHERE MONTH(data) = ? ORDER BY dia";
    db.query(ssql, [mes], function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ListarAniversariosFranquias(mes, callback) {
    let ssql = "SELECT nome_fantasia as titulo, DAY(data_inauguracao) as dia FROM franquias WHERE MONTH(data_inauguracao) = ? AND status = 'ativa'";
    db.query(ssql, [mes], function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ListarAniversariosColaboradores(mes, callback) {
    let ssql = "SELECT nome as titulo, DAY(data_nascimento) as dia FROM colaboradores WHERE MONTH(data_nascimento) = ? AND status = 'ativo'";
    db.query(ssql, [mes], function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function CriarEvento(dados, callback) {
    let ssql = "INSERT INTO eventos (titulo, descricao, data, tipo, criado_por) VALUES (?, ?, ?, ?, ?)";
    let filtro = [dados.titulo, dados.descricao || null, dados.data, dados.tipo, dados.criado_por];
    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

function ExcluirEvento(id, callback) {
    let ssql = "DELETE FROM eventos WHERE id = ?";
    db.query(ssql, [id], function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { ListarEventosDoMes, ListarAniversariosFranquias, ListarAniversariosColaboradores, CriarEvento, ExcluirEvento };