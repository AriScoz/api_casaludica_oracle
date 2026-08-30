import {db} from "../config/database.js";

function CriarUsuario(dados, callback) {
    let { nome, usuario, senha, email, nivel_acesso } = dados;
    let ssql = "INSERT INTO usuarios (nome, usuario, senha, email, nivel_acesso) VALUES (?, ?, ?, ?, ?)";
    let filtro = [nome, usuario, senha, email, nivel_acesso];

    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function ListarUsuarios(callback) {
    let ssql = "SELECT id, nome, usuario, email, nivel_acesso, ativo, criado_em FROM usuarios ORDER BY nome";
    db.query(ssql, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

function AlternarAtivoUsuario(id, ativo, callback) {
    let ssql = "UPDATE usuarios SET ativo = ? WHERE id = ?";
    let filtro = [ativo, id];
    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

export default { CriarUsuario, ListarUsuarios, AlternarAtivoUsuario };