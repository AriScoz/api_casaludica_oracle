import modelCalendario from "../models/model.calendario.js";

function ListarCalendario(request, response) {
    const mes = parseInt(request.query.mes) || (new Date().getMonth() + 1);

    if (mes < 1 || mes > 12) {
        return response.status(400).json({ error: 'Mês inválido' });
    }

    modelCalendario.ListarEventosDoMes(mes, function (errEventos, eventos) {
        if (errEventos) {
            return response.status(500).json({ error: 'Erro ao buscar eventos' });
        }

        modelCalendario.ListarAniversariosFranquias(mes, function (errFranquias, franquias) {
            if (errFranquias) {
                return response.status(500).json({ error: 'Erro ao buscar aniversários de franquias' });
            }

            modelCalendario.ListarAniversariosColaboradores(mes, function (errColaboradores, colaboradores) {
                if (errColaboradores) {
                    return response.status(500).json({ error: 'Erro ao buscar aniversários de colaboradores' });
                }

                const itens = [
                    ...eventos.map(e => ({ ...e, origem: 'evento' })),
                    ...franquias.map(f => ({ dia: f.dia, titulo: f.titulo, tipo: 'aniversario_franquia', origem: 'franquia' })),
                    ...colaboradores.map(c => ({ dia: c.dia, titulo: c.titulo, tipo: 'aniversario_colaborador', origem: 'colaborador' })),
                ];

                itens.sort((a, b) => a.dia - b.dia);

                response.status(200).json(itens);
            });
        });
    });
}

function CriarEvento(request, response) {
    const { titulo, descricao, data, tipo } = request.body;

    if (!titulo || !data) {
        return response.status(400).json({ error: 'Título e data são obrigatórios' });
    }

    const dados = {
        titulo,
        descricao,
        data,
        tipo: tipo || 'outro',
        criado_por: request.usuario.id
    };

    modelCalendario.CriarEvento(dados, function (err, result) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao criar evento' });
        }
        response.status(201).json({ id: result.insertId, ...dados });
    });
}

function ExcluirEvento(request, response) {
    const { id } = request.params;

    modelCalendario.ExcluirEvento(id, function (err) {
        if (err) {
            return response.status(500).json({ error: 'Erro ao excluir evento' });
        }
        response.status(200).json({ sucesso: true });
    });
}

export default { ListarCalendario, CriarEvento, ExcluirEvento };