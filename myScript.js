const url = "http://127.0.0.1:8000";

let numeroDomandeTotali;
let domanda;
let punteggio = 0;

let formIniziale = `<form onsubmit="event.preventDefault()" id="formIniziale" class="form">
                        <select name="numeroDomande" id="numeroDomande">
                            <option value="default">Seleziona il numero di domande</option>
                            <option value="5">5 domande</option>
                            <option value="10">10 domande</option>
                            <option value="15">15 domande</option>
                        </select>
                        <br>
                        <br>
                        <button type="submit" onclick="prelevaDatiForm()">Invia</button>
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
                    <div id="punteggio">5/5</div>
                    <br>
                    <div id="percentuale">100%</div>
                </div>`;

let spuntaVerde = `<img src="Immagini/Spunte/SpuntaVerde.png" alt="" id="esitoRisposta"></img>`
let croceRossa = `<img src="Immagini/Spunte/CroceRossa.png" alt="" id="esitoRisposta"></img>`

async function onLoad_Setup(){
    document.getElementById("contenitoreForm").innerHTML = formIniziale;
    formIniziale = document.getElementById("formIniziale");

    let dati;

    await fetch(url + "/init").then(
        response => response.json()
    ).then((data) => {
        dati = data;
    }).catch(error => console.log("Si è verificato un errore!"))
}

function prelevaDatiForm(){
    let indiceSelezionato = formIniziale.numeroDomande.selectedIndex;
    numeroDomandeTotali = Number.parseInt(formIniziale.numeroDomande.options[indiceSelezionato].value);
    let numeroDomande = Number.parseInt(formIniziale.numeroDomande.options[indiceSelezionato].value);
    if(isNaN(numeroDomande)) alert("Seleziona il numero di domande!");
    else chiediDomanda(numeroDomande);
}

async function chiediDomanda(numeroDomande){
    console.log(numeroDomande);
    if(numeroDomande == 0) {
        alert("Quiz terminato!");
        document.getElementById("contenitoreDomanda").innerHTML = "";
        document.getElementById('contenitorePunteggio').innerHTML = fineQuiz;
        document.getElementById("punteggio").innerHTML = `${punteggio}/${numeroDomandeTotali}`;
        document.getElementById("percentuale").innerHTML = `${(punteggio / numeroDomandeTotali) * 100}%`;
        return;
    }

    await fetch(url + "/chiediDomanda?" + new URLSearchParams({categoria: "ALL"}).toString()).then(
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

    let idRisposta = 0;

    for (i = 0; i < radioRisposta.length; i++) {
        if (radioRisposta[i].checked){
            idRisposta = i;
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
            //alert("Risposta esatta!");
            punteggio++;
        }
        else {
            document.getElementById('contenitoreEsitoRisposta').innerHTML = croceRossa;
            await new Promise(resolve => setTimeout(resolve, 1000));
            document.getElementById('contenitoreEsitoRisposta').innerHTML = "";
            //alert("Risposta sbagliata...");
        }

        chiediDomanda(numeroDomande);
    }).catch(error => console.log("Si è verificato un errore!"))
}

/*function poniDomanda(domanda){
    let spazioDomanda = document.getElementById("domanda");
    console.log("ciao");
    spazioDomanda.innerHTML += `${domanda.numeroDomanda} ${domanda.testoDomanda}`;
}*/

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
    

    /*try {
        const response = await fetch(url + "aggDati", options);
        const result = await response.json();
        console.log("Esito:", result.esito);
    } catch (error) {
        console.error("Error:", error);
    }*/
}