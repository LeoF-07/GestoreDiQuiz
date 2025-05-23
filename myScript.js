const url = "http://127.0.0.1:8000";

let numeroDomandeTotali;
let categoria;
let domanda;
let punteggio = 0;

let formIniziale;
let formInizialeH = `<form onsubmit="event.preventDefault()" id="formIniziale" class="form">
                        <div id="contenitoreSelects">
                            <select name="categoriaDomande" id="categoriaDomande">
                                <option value="default">Seleziona la categoria di domande</option>
                                <option value="ALL">Qualsiasi</option>
                                <option value="scienza">Scienza</option>
                                <option value="geografia">Geografia</option>
                                <option value="culturaGenerale">Cultura Generale</option>
                                <option value="filmETecnologia">Film e Tecnologia</option>
                            </select>
                            <select name="numeroDomande" id="numeroDomande">
                                <option value="default">Seleziona il numero di domande</option>
                                <option value="5">5 domande</option>
                                <option value="10">10 domande</option>
                            </select>
                        </div>
                        <br>
                        <br>
                        <button type="submit" onclick="prelevaDatiForm()" id="pulsanteInviaForm">Invia</button>
                    </form>`;

let formDomanda =  `<div id="testoEFormDomanda">
                        <div id="contenitoreMedia"></div>
                        <div id="testoDomanda">Domanda</div>
                        <form onsubmit="event.preventDefault()" id="formDomanda" class="form">
                            <div id="radioRisposte"></div>
                        </form>
                    </div>`

let fineQuiz = `<div id="fineQuiz">
                    Hai completato il quiz!<br><br><br>
                    Hai ottenuto il seguente punteggio<br><br>
                    <div id="punteggio"></div>
                    <br>
                    <div id="percentuale"></div>
                    <br><br>
                    <button onclick="onLoad_Setup()">Ritenta Quiz</button>
                </div>`;

let spuntaVerde = `<img src="ImmaginiEVideo/Spunte/SpuntaVerde.png" alt="Risposta esatta!" id="esitoRisposta"></img>`
let croceRossa = `<img src="ImmaginiEVideo/Spunte/CroceRossa.png" alt="Risposta errata..." id="esitoRisposta"></img>`

async function onLoad_Setup(){
    document.getElementById("contenitorePunteggio").innerHTML = "";
    document.getElementById("contenitoreForm").innerHTML = formInizialeH;
    formIniziale = document.getElementById("formIniziale");

    await fetch(url + "/init").catch(error => console.log("Si è verificato un errore!"))
}

function prelevaDatiForm(){
    let indiceSelezionatoN = formIniziale.numeroDomande.selectedIndex;
    numeroDomandeTotali = Number.parseInt(formIniziale.numeroDomande.options[indiceSelezionatoN].value);
    let numeroDomande = Number.parseInt(formIniziale.numeroDomande.options[indiceSelezionatoN].value);

    let indiceSelezionatoC = formIniziale.categoriaDomande.selectedIndex;
    categoria = formIniziale.categoriaDomande.options[indiceSelezionatoC].value;

    if(categoria == "default") alert("Seleziona la categoria di domande!");
    if(isNaN(numeroDomande)) alert("Seleziona il numero di domande!");
    if(categoria != "default" && !isNaN(numeroDomande)) chiediDomanda(categoria, numeroDomande);
}

async function chiediDomanda(categoria, numeroDomande){
    console.log(numeroDomande);
    if(numeroDomande == 0) {
        alert("Quiz terminato!");
        document.getElementById("contenitoreDomanda").innerHTML = "";
        document.getElementById('contenitorePunteggio').innerHTML = fineQuiz;
        document.getElementById("punteggio").innerHTML = `${punteggio}/${numeroDomandeTotali}`;
        document.getElementById("percentuale").innerHTML = `${((punteggio / numeroDomandeTotali) * 100).toFixed(2)}%`;
        return;
    }

    await fetch(url + "/chiediDomanda?" + new URLSearchParams({categoria: categoria}).toString()).then(
        response => response.json()
    ).then((data) => {
        numeroDomande--;

        document.getElementById("contenitoreForm").innerHTML = "";
        document.getElementById("contenitoreDomanda").innerHTML = formDomanda;

        let contenitoreMedia = document.getElementById("contenitoreMedia");
        if(data.tipoMedia == "immagine"){
            let immagine = document.createElement('img');
            immagine.src = data.media;
            immagine.classList.add('media')
            contenitoreMedia.appendChild(immagine);
        }
        if(data.tipoMedia == "video"){
            contenitoreMedia.innerHTML +=  `<video width="320" height="240" class="media" controls>
                                                <source src="${data.media}" type="video/mp4">
                                            </video>`
        }

        document.getElementById("testoDomanda").innerHTML = data.testoDomanda;

        let radioRisposte = document.getElementById('radioRisposte');

        for(let i in data.risposte){
            let risposta = document.createElement("input");
            risposta.id = i;
            risposta.type = "radio";
            risposta.name = "risposta";
            risposta.value = data.risposte[i];
            radioRisposte.appendChild(risposta);
            radioRisposte.innerHTML += `${data.risposte[i]}<br>`;
        }

        document.getElementById("formDomanda").innerHTML += `<button type="submit" onclick="chiediRisposta('${numeroDomande}', '${data.id}')" id="pulsanteInviaRisposta">Invia</button>`;
    }).catch(error => console.log("Si è verificato un errore!"))

}

async function chiediRisposta(numeroDomande, id, i) {
    let radioRisposta = document.getElementsByName('risposta');
    let risposta;

    for (i = 0; i < radioRisposta.length; i++) {
        if (radioRisposta[i].checked){
            risposta = radioRisposta[i].value;
            break;
        }
    }

    await fetch(url + "/chiediRisposta?" + new URLSearchParams({id: id, risposta: risposta}).toString()).then(
        response => response.json()
    ).then(async (data) => {
        if(data.esito == "corretto") {
            document.getElementById('contenitoreEsitoRisposta').innerHTML = spuntaVerde;
            await new Promise(resolve => setTimeout(resolve, 1000));
            document.getElementById('contenitoreEsitoRisposta').innerHTML = "";
            punteggio++;
        }
        else {
            document.getElementById('contenitoreEsitoRisposta').innerHTML = croceRossa;
            await new Promise(resolve => setTimeout(resolve, 1000));
            document.getElementById('contenitoreEsitoRisposta').innerHTML = "";
        }

        chiediDomanda(categoria, numeroDomande);
    }).catch(error => console.log("Si è verificato un errore!"))
}

async function inviaRisposta() {
    dati = {"studenti": studenti};

    const options = {
        method: 'POST',
        body: JSON.stringify(dati)
    };

    
    await fetch(url + "/aggDati", options).then(
        response => response.json()
    ).then((data) => {
        console.log(data);
    }).catch(error => console.log("Si è verificato un errore!"))
}