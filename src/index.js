import express from "express";
import cors from "cors";
import routeLogin from "./routes/route.login.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import { PORT } from './config/config.js'
import routeUsuarios from "./routes/route.usuarios.js";
import routeBanner from "./routes/route.banner.js";
import routeFranquias from "./routes/route.franquias.js";

const app = express();

app.use(express.json());

const origensPermitidas = [
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origensPermitidas.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    }
}));

const rotasPublicas = ["/login"];

app.use((request, response, next) => {
    if (rotasPublicas.includes(request.path)) {
        return next();
    }
    verifyToken(request, response, next);
});

app.use(routeLogin);
app.use(routeUsuarios);
app.use(routeBanner);
app.use(routeFranquias);

app.listen(PORT, () => {
    console.log("API Casa Ludica rodando na porta:", PORT);
});