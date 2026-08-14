const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const tiposArquivos = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};

async function buscarClima(cidade) {
    const urlCidade =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

    const respostaCidade = await fetch(urlCidade);

    if (!respostaCidade.ok) {
        throw new Error("Erro ao buscar a cidade.");
    }

    const dadosCidade = await respostaCidade.json();

    if (!dadosCidade.results || dadosCidade.results.length === 0) {
        throw new Error("Cidade não encontrada.");
    }

    const local = dadosCidade.results[0];

    const urlClima =
        `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}` +
        `&longitude=${local.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&timezone=auto`;

    const respostaClima = await fetch(urlClima);

    if (!respostaClima.ok) {
        throw new Error("Erro ao buscar os dados do clima.");
    }

    const dadosClima = await respostaClima.json();

    return {
        cidade: local.name,
        estado: local.admin1 || "",
        pais: local.country || "",
        temperatura: dadosClima.current.temperature_2m,
        sensacao: dadosClima.current.apparent_temperature,
        umidade: dadosClima.current.relative_humidity_2m,
        vento: dadosClima.current.wind_speed_10m,
        codigoClima: dadosClima.current.weather_code
    };
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/clima") {
        const cidade = url.searchParams.get("cidade");

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!cidade) {
            res.statusCode = 400;
            res.end(
                JSON.stringify({
                    erro: "Informe o nome de uma cidade."
                })
            );
            return;
        }

        try {
            const clima = await buscarClima(cidade);

            res.statusCode = 200;
            res.end(JSON.stringify(clima));
        } catch (erro) {
            res.statusCode = 404;
            res.end(
                JSON.stringify({
                    erro: erro.message
                })
            );
        }

        return;
    }

    let caminhoArquivo =
        url.pathname === "/"
            ? path.join(__dirname, "index.html")
            : path.join(__dirname, url.pathname);

    const extensao = path.extname(caminhoArquivo).toLowerCase();

    fs.readFile(caminhoArquivo, (erro, conteudo) => {
        if (erro) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("Página não encontrada.");
            return;
        }

        res.statusCode = 200;
        res.setHeader(
            "Content-Type",
            tiposArquivos[extensao] || "application/octet-stream"
        );

        res.end(conteudo);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
