import {db} from "../config/database.js";

function BuscarPorUsuario(usuario, callback) {
    let filtro = [usuario];
    let ssql = "SELECT * FROM usuarios WHERE usuario = ? AND ativo = TRUE";
    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, []);
        } else {
            callback(undefined, result);
        }
    });
}

export default { BuscarPorUsuario };