const http = require('http');
const url = require('url');
const fs = require("fs");
const { randomInt } = require('crypto');
const PORT = 8000;

let contenutoFile = [];

const server = http.createServer((req, res) => {
    console.log(req.url);
    console.log(req.method);

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        if(parsedUrl.pathname === '/init'){
            fs.readFile(__dirname + '/db.json', function (error, data) {
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

                    contenutoFile = JSON.parse(data).domande;
                    console.log(contenutoFile);

                    res.write(JSON.stringify(JSON.parse(data)));
                    res.end();
                }
            });
        }
        /*if (parsedUrl.pathname === '/chiediDomanda') {
            fs.readFile(__dirname + '/db.json', function (error, data) {
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

                    const categoria = parsedUrl.query.categoria;
                    if(categoria == "ALL"){
                        const domande = JSON.parse(data).domande;
                        const n = randomInt(domande.length);
                        res.write(JSON.stringify(domande[n]));
                        res.end();
                    }
                }
            });
        }*/

        if (parsedUrl.pathname === '/chiediDomanda') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
    
            const categoria = parsedUrl.query.categoria;
            if(categoria == "ALL"){
                const n = randomInt(contenutoFile.length);
                res.write(JSON.stringify(contenutoFile[n]));
                res.end();
            } 
        }

        if (parsedUrl.pathname === '/chiediRisposta') {
            fs.readFile(__dirname + '/db.json', function (error, data) {
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

                    const id = parsedUrl.query.id;
                    const risposta = parsedUrl.query.risposta;

                    if (id != null && risposta != null) {
                        const domande = JSON.parse(data).domande;
                        
                        for(let i in domande){
                            if(domande[i].id == id){
                                console.log(domande[i].rispostaCorretta);
                                console.log(risposta);
                                if(domande[i].rispostaCorretta == risposta){
                                    res.end(JSON.stringify({esito: "corretto"}));
                                    return;
                                }
                                return;
                            }
                        }
                        res.end(JSON.stringify({esito: "sbagliato"}));
                    }
                }
            });
        }
    } else
        if (req.method === 'POST') {
            if (req.url === '/aggDati') {
                let datiAgg = ''
                req.on('data', function (data) {
                    datiAgg += data
                })
                req.on('end', function () {
                    fs.writeFile(__dirname + '/domandeDaPescare.json', datiAgg, (err) => {
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