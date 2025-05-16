const http = require('http');
const url = require('url');
const fs = require("fs");
const { randomInt } = require('crypto');
const PORT = 8000;

let domande = [];
let risposte = [];

const server = http.createServer((req, res) => {
    console.log(req.url);
    console.log(req.method);

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        if(parsedUrl.pathname === '/init'){
            fs.readFile(__dirname + '/domande.json', function (error, data) {
                if (error) {
                    res.writeHead(404);
                    res.write(error);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    });

                    domande = JSON.parse(data).domande;
                    risposte = JSON.parse(data).risposte;

                    res.write(JSON.stringify(JSON.parse(data)));
                    res.end();
                }
            });
        }

        if (parsedUrl.pathname === '/chiediDomanda') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
    
            const categoria = parsedUrl.query.categoria;
            if(categoria == "ALL"){
                const n = randomInt(domande.length);
                res.write(JSON.stringify(domande[n]));
                res.end();
                domande.splice(n, 1);
            } 
        }

        if (parsedUrl.pathname === '/chiediRisposta') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type'
            });

            const id = parsedUrl.query.id;
            const risposta = parsedUrl.query.risposta;

            if (id != null && risposta != null) {
                        
                for(let i in risposte){
                    if(risposte[i].id == id){
                        if(risposte[i].rispostaCorretta == risposta){
                            res.end(JSON.stringify({esito: "corretto"}));
                            return;
                        }
                        res.end(JSON.stringify({esito: "sbagliato"}));
                        return;
                    }
                }
            }
                
        }
    } else
        if (req.method === 'POST') {
            if (req.url === '/aggDati') {
                let datiAgg = ''
                req.on('data', function (data) {
                    datiAgg += data
                })
                req.on('end', function () {
                    fs.writeFile(__dirname + '/domande.json', datiAgg, (err) => {
                        let riscritto = "";
                        if (err)
                            riscritto = "non riuscito";
                        else {
                            //console.log(fs.readFileSync(__dirname + '/db.json', "utf8"));
                            riscritto = "riuscito";
                        }
                        // invia al client l'esito dell'aggiornamento
                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, POST, PUT',
                            'Access-Control-Allow-Headers': 'Content-Type'
                        });
                        res.write(JSON.stringify({ esito: riscritto }));
                        res.end();
                    });
                })
            }
        }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;