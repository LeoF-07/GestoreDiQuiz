const url = "http://127.0.0.1:8000";

let numeroDomande;
let domanda;
let punteggio = 0;

let formIniziale = `<form onsubmit="event.preventDefault()" id="formIniziale" class="form">
                        <select name="numeroDomande" id="numeroDomande">
                            <option value="default">Seleziona il numero di domande</option>
                            <option value="5">5 domande</option>
                        </select>
                        <br>
                        <br>
                        <button type="submit" onclick="prelevaDatiForm()">Invia</button>
                    </form>`;

let formDomanda =  `<div id="testoEFormDomanda">
                        <div id="testoDomanda">Domanda</div>
                        <form onsubmit="event.preventDefault()" id="formDomanda" class="form"></form>
                    </div>`

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
    let numeroDomande = Number.parseInt(formIniziale.numeroDomande.options[indiceSelezionato].value);
    if(isNaN(numeroDomande)) alert("Seleziona il numero di domande!");
    else chiediDomanda(numeroDomande);
}

async function chiediDomanda(numeroDomande){
    console.log(numeroDomande);
    if(numeroDomande == 0) {
        alert("Quiz terminato!");
        document.body.innerHTML += punteggio;
        return;
    }

    await fetch(url + "/chiediDomanda?" + new URLSearchParams({categoria: "ALL"}).toString()).then(
        response => response.json()
    ).then((data) => {
        numeroDomande--;

        document.getElementById("contenitoreForm").innerHTML = "";
        document.getElementById("contenitoreDomanda").innerHTML = formDomanda;
        let form = document.getElementById("formDomanda");

        document.getElementById("testoDomanda").innerHTML = data.testoDomanda;

        let risposta1 = document.createElement("input");
        risposta1.type = "radio";
        risposta1.name = "risposta";
        risposta1.value = data.risposta1;
        form.appendChild(risposta1);
        form.innerHTML += `${data.risposta1}<br>`;

        let risposta2 = document.createElement("input");
        risposta2.type = "radio";
        risposta2.name = "risposta";
        risposta2.value = data.risposta2;
        form.appendChild(risposta2);
        form.innerHTML += `${data.risposta2}<br>`;

        document.getElementById("formDomanda").innerHTML += `<button type="submit" onclick="chiediRisposta('${numeroDomande}', '${data.id}')">Invia</button>`;
    }).catch(error => console.log("Si è verificato un errore!"))

}

async function chiediRisposta(numeroDomande, id) {
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
    ).then((data) => {
        if(data.esito == "corretto") {
            alert("Risposta esatta!");
            punteggio++;
        }
        else alert("Risposta sbagliata...");

        chiediDomanda(numeroDomande);
    }).catch(error => console.log("Si è verificato un errore!"))
}

function poniDomanda(domanda){
    let spazioDomanda = document.getElementById("domanda");
    console.log("ciao");
    spazioDomanda.innerHTML += `${domanda.numeroDomanda} ${domanda.testoDomanda}`;
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
    

    /*try {
        const response = await fetch(url + "aggDati", options);
        const result = await response.json();
        console.log("Esito:", result.esito);
    } catch (error) {
        console.error("Error:", error);
    }*/
}