import {db} from "../config/database.js";

function ObterBanner(tela, callback) {
    let ssql = "SELECT valor FROM configuracoes WHERE chave = ?";
    let filtro = [`banner_${tela}`];
    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result.length > 0 ? result[0].valor : null);
        }
    });
}

function SalvarBanner(tela, url, callback) {
    let ssql = "INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?";
    let filtro = [`banner_${tela}`, url, url];
    db.query(ssql, filtro, function(err, result){
        if (err){
            callback(err, null);
        } else {
            callback(undefined, result);
        }
    });
}

export default { ObterBanner, SalvarBanner };