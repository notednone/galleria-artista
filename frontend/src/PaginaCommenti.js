import * as THREE from 'three';

// PaginaCommenti.js - Configurazione Totale

// Aggiungi questa variabile in cima al file PaginaCommenti.js
let visualeIniziale = true;

let targetCameraPos = null;
let isTransitioning = false;
let tempo = 0;
let targetFuoco = new THREE.Vector3();

function creaRaggiFaro(faro) {
    const gruppoRaggi = new THREE.Group();
    
    // 1. L'AURA (Un bagliore soffuso centrale)
    const auraGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.15
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    gruppoRaggi.add(aura);

    // 2. I FILAMENTI (Linee sottili e asimmetriche)
    for (let i = 0; i < 40; i++) {
        const materialeFilamento = new THREE.LineBasicMaterial({ 
            color: 0xD4AF37, 
            transparent: true, 
            opacity: Math.random() * 0.5 
        });

        // Creiamo una traiettoria spezzata (frastagliata) per ogni raggio
        const punti = [];
        punti.push(new THREE.Vector3(0, 0, 0));
        
        // Punto intermedio casuale per l'effetto "frastagliato"
        const mid = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        punti.push(mid);
        
        // Punto finale
        const end = mid.clone().multiplyScalar(1.5 + Math.random());
        punti.push(end);

        const geo = new THREE.BufferGeometry().setFromPoints(punti);
        const raggio = new THREE.Line(geo, materialeFilamento);
        
        // Salviamo una velocità di rotazione casuale per l'animazione
        raggio.userData = { speed: (Math.random() - 0.5) * 0.02 };
        gruppoRaggi.add(raggio);
    }

    faro.add(gruppoRaggi);
    faro.userData.raggi = gruppoRaggi; // Lo agganciamo per animarlo
}








export function initPaginaCommenti() {
    // 1. PREPARAZIONE DEL CONTENITORE
    const vecchioHeader = document.querySelector('h1');
    if (vecchioHeader) vecchioHeader.remove();

    // Rimuoviamo eventuali Overlay/Fumetti aperti
    const vecchioOverlay = document.getElementById('comment-overlay');
    if (vecchioOverlay) vecchioOverlay.remove();

    const container = document.getElementById('comment-section-container');
    if (!container) return;
    let targetCameraPos = null;
    let isTransitioning = false;
    let targetY = 0;
    let totem;

    // Applichiamo lo stile al contenitore
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.backgroundColor = 'black';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';

    // 2. SETUP DEL MOTORE 3D
    const scena = new THREE.Scene();

    // CREIAMO LA CAMERA (Deve venire prima di impostarne la posizione!)
    // Camera dal basso per l'effetto monumentale
    // CAMERA: Ravvicinata alla base, guarda verso l'alto e leggermente a destra
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    // Più vicina (z:18) e leggermente più alta (y:-10)
    camera.position.set(-4, -10, 18); 
    // Guardiamo un punto più basso rispetto a prima (y:4) per inclinare lo sguardo
    camera.lookAt(2, 4, 0); 





    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 3. LUCI
    const luceAmbiente = new THREE.AmbientLight(0xfff5e6, 0.5); 
    scena.add(luceAmbiente);

    const lucePuntiforme = new THREE.PointLight(0xffcc80, 2);
    lucePuntiforme.position.set(5, 5, 20);
    scena.add(lucePuntiforme);

    // --- DA QUI IN POI IL CODICE CONTINUA CON IL TUO STEP 2 (DatiGusci, ecc.) ---


        // --- STEP 2: COSTRUZIONE GEOMETRIA E PAROLE ---

    const gruppoEllissoidi = new THREE.Group(); // Contenitore per tutto
    scena.add(gruppoEllissoidi);


    // SPAZIO STELLATO
    const stelleGeo = new THREE.BufferGeometry();
    const stellePos = [];
    const stelleColori = [];
    const coloreStelle = new THREE.Color();

    for (let i = 0; i < 3000; i++) {
        // Distribuzione sferica molto ampia
        const r = 500 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        stellePos.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        // Varie sfumature di bianco e oro pallido per le stelle
        const vibranza = 0.7 + Math.random() * 0.3;
        coloreStelle.setHSL(0.1, 0.2, vibranza);
        stelleColori.push(coloreStelle.r, coloreStelle.g, coloreStelle.b);
    }

    stelleGeo.setAttribute('position', new THREE.Float32BufferAttribute(stellePos, 3));
    stelleGeo.setAttribute('color', new THREE.Float32BufferAttribute(stelleColori, 3));

    const stelleMat = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const sistemaStellato = new THREE.Points(stelleGeo, stelleMat);
    scena.add(sistemaStellato);






    // Parametri dell'ellissoide (Verticale)
        // Parametri dell'ellissoide (assicurati che siano definiti sopra)
    const raggioX = 8; const raggioY = 15; const raggioZ = 8;

    // IL MONUMENTO COME RETE DI LINEE (Quadratura)
    const totemGeo = new THREE.SphereGeometry(1, 80, 80); // Alta densità per eleganza
    
    // Materiale Wireframe elegante con riflessi
    // TOTEM: MeshPhong per permettere le ombreggiature mobili
    const totemMat = new THREE.MeshPhongMaterial({ 
        color: 0x000000, 
        emissive: 0x111111,
        specular: 0xD4AF37, // Riflessi oro
        shininess: 100,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    // (Usa questo totemMat per la creazione del totem)
    totem = new THREE.Mesh(totemGeo, totemMat); 
    totem.scale.set(raggioX, raggioY, raggioZ); 
    scena.add(totem);

    // AGGIUNGIAMO UNA LUCE MOBILE (Per i riflessi "ammiccanti")
    const luceMobile = new THREE.PointLight(0xD4AF37, 2, 50);
    scena.add(luceMobile);


    const luceTotem = new THREE.PointLight(0xffffff, 1);
    luceTotem.position.set(0, 10, 15);
    scena.add(luceTotem);



    // --- DEFINIZIONE DATI (Senza questa dà errore!) ---
    const datiGusci = [
        { testo: "Abisso generatore di forme dove il tempo si sgretola nell'eterno.", colore: "#D4AF37" }, // Oro
        { testo: "Silenzio assordante che scolpisce la materia con dita d'ombra.", colore: "#F5F5F5" },   // Bianco Fumo
        { testo: "Geometrie dell'anima proiettate oltre l'orizzonte degli eventi.", colore: "#9E9E9E" }  // Argento spento
    ];

const articoli = ["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "del", "dello", "della", "dei", "degli", "delle", "a", "da", "in", "con", "su", "per", "tra", "fra", "e", "che", "dove", "nell'", "sull'", "all'", "si"]; // <--- Aggiunto 'si'


    datiGusci.forEach((guscio, indexGuscio) => {
        const paroleRaw = guscio.testo.split(" ");
        const paroleUnite = [];

        for (let i = 0; i < paroleRaw.length; i++) {
            let p = paroleRaw[i].toLowerCase();
            
            // 1. PRIORITÀ: Accorpamento "dove il tempo" (3 parole)
            if (p === "dove" && paroleRaw[i+1]?.toLowerCase() === "il") {
                paroleUnite.push(paroleRaw[i] + " " + paroleRaw[i+1] + " " + paroleRaw[i+2]);
                i += 2; 
            } 
            // 2. Articoli e particelle standard (2 parole)
            else if (articoli.includes(p) && i < paroleRaw.length - 1) {
                paroleUnite.push(paroleRaw[i] + " " + paroleRaw[i+1]);
                i++; 
            } 
            // 3. Parola singola
            else {
                paroleUnite.push(paroleRaw[i]);
            }
        }
        
        // ... qui continua il resto del codice (raggioOffset, ecc.)


        const raggioOffset = indexGuscio * 2.5; 
        const arcoVisibile = 1.2; 

         paroleUnite.forEach((testoCompleto, i) => {
            // 1. CALCOLO COORDINATE (Ancoraggio millimetrico alla pelle)
            const t = i / (paroleUnite.length - 1);
            const arcoOrizzontale = 4.2; 
            const theta = -(t * arcoOrizzontale - (arcoOrizzontale / 2));
            
            // Portiamo i raggi leggermente fuori (0.1) per farli sembrare appoggiati
            const raggioPelleX = raggioX + 0.1;
            const raggioPelleZ = raggioZ + 0.1;
            const yGuscio = (indexGuscio * 10) - 10; 

            const x = raggioPelleX * Math.cos(theta);
            const y = yGuscio; 
            const z = raggioPelleZ * Math.sin(theta);

            // 2. DISEGNO DEL TESTO (Preserviamo Montserrat e Colori)
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 1200; canvas.height = 200;
            context.font = '900 80px "Montserrat", sans-serif'; 
            context.fillStyle = guscio.colore;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.letterSpacing = "8px"; 
            context.fillText(testoCompleto.toUpperCase(), 600, 100);

            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true, 
                opacity: 0,
                depthTest: false 
            }));
            
            sprite.position.set(x, y, z);
            sprite.scale.set(8, 1.6, 1);
            sprite.visible = false;

            // 3. PULIZIA TESTO HEADER (Prendiamo solo l'ultima parola del blocco)
            // Prende solo l'ultima parola (es: da "DOVE IL TEMPO" estrae "TEMPO")
            const parti = testoCompleto.split(" ");
            const parolaHeader = parti[parti.length - 1].toUpperCase().replace(/[.,]/g, "");

            sprite.userData = { 
                testoHeader: parolaHeader, // Sarà solo "TEMPO"
                cliccabile: false, 
                guscioPadre: indexGuscio 
            };

            gruppoEllissoidi.add(sprite);

            // 4. FARO INIZIALE (Sulla pelle del monumento)
            if (i === 0) {
                const faro = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6, 32, 32), 
                    new THREE.MeshBasicMaterial({ color: 0xD4AF37 })
                );
                faro.position.set(x, y, z);
                faro.userData = { tipo: "faro_inizio", guscioIndex: indexGuscio, cliccabile: true };
                faro.visible = true; 
                gruppoEllissoidi.add(faro);
                
                if (typeof creaRaggiFaro === "function") {
                    creaRaggiFaro(faro);
                }
            }
        });


 // Fine paroleUnite.forEach












        // Punti fiochi della quadratura
        const puntiGeometria = new THREE.BufferGeometry();
        const posizioniPunti = [];
        for (let i = 0; i < 100; i++) {
            const p = Math.random() * Math.PI;
            const t = Math.random() * Math.PI * 2;
            posizioniPunti.push(
                (raggioX + raggioOffset) * Math.sin(p) * Math.cos(t),
                (raggioY + raggioOffset) * Math.cos(p),
                (raggioZ + raggioOffset) * Math.sin(p) * Math.sin(t)
            );
        }
        puntiGeometria.setAttribute('position', new THREE.Float32BufferAttribute(posizioniPunti, 3));
            // Definiamo il materiale prima di usarlo
        const materialePunti = new THREE.PointsMaterial({ 
            color: 0xffcc80, 
            size: 0.04, 
            transparent: true, 
            opacity: 0.2 
        });

        // Ora creiamo l'oggetto Points usando il materiale appena definito
        const nuvolaPunti = new THREE.Points(puntiGeometria, materialePunti);
        gruppoEllissoidi.add(nuvolaPunti);
            });




    // Movimento monumentale: lenta rotazione
    // (Aggiungi questo dentro la funzione animate() più in basso)
    // gruppoEllissoidi.rotation.y += 0.001;


    // --- STEP 3: INTERAZIONE (CLICK E ZOOM) ---

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();




    // E. CICLO DI ANIMAZIONE
    let tempo = 0; // Serve per calcolare l'oscillazione

    // Funzione che gestisce il click
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        // Cerchiamo in tutta la scena (per includere griglia e monumenti)
        const colpiti = raycaster.intersectObjects(scena.children, true);

        if (colpiti.length > 0) {
            for (let i = 0; i < colpiti.length; i++) {
                const obj = colpiti[i].object;

                // --- FASE 1: IL FARO (Decollo) ---
                if (obj.userData.tipo === "faro_inizio" || (obj.parent && obj.parent.userData.tipo === "faro_inizio")) {
                    const faro = obj.userData.tipo === "faro_inizio" ? obj : obj.parent;
                    if (!isTransitioning) {
                        console.log("Faro intercettato: decollo!");
                        avviaVoloGeodetico(faro);
                    }
                    return;
                }
                
                // --- FASE 2: LA PAROLA (Transizione ai Commenti) ---
    if (obj.type === "Sprite" && obj.userData.cliccabile && obj.visible) { 
        // Aggiungi 'obj.visible' per essere sicuri che non clicchi parole nascoste
        avviaTransizione(obj);
        return;
    }

                
                // --- FASE 3: L'AVATAR (Apertura Commento) ---
                if (obj.userData.tipo === "avatar" || (obj.parent && obj.parent.userData.tipo === "avatar")) {
                    const avatar = obj.userData.tipo === "avatar" ? obj : obj.parent;
                    console.log("Avatar intercettato: apertura discussione!");
                    apriDiscussione(avatar);
                    return;
                }
            }
        } else {
            console.log("Click nel vuoto stellato.");
        }
    });






    function tornaAlleFrasi() {
        // 1. Reset immediato degli stati di volo
        isTransitioning = false;
        targetCameraPos = null;
        targetY = 0; // Reset del fuoco della camera

        // 2. Rimozione fisica degli elementi (Header e Griglia)
        const h = document.querySelector('h1');
        if (h) h.remove();

        const grigliaEsistente = scena.getObjectByName("gruppoGriglia");
        if (grigliaEsistente) scena.remove(grigliaEsistente);

        // 3. Ripristino visibilità monumentale
        if (totem) totem.visible = true;
        if (typeof sistemaStellato !== 'undefined') sistemaStellato.visible = true;
        gruppoEllissoidi.visible = true;
        
        gruppoEllissoidi.children.forEach(child => {
            if (child.userData.tipo === "faro_inizio") child.visible = true;
            if (child.type === "Sprite") {
                child.visible = false;
                child.userData.cliccabile = false; // Disabilita il click sulle parole
            }
        });

        // 4. Forza la camera a tornare alla posizione iniziale monumentale
        camera.position.set(-4, -10, 18);
        camera.lookAt(2, 4, 0);
    }





function avviaTransizione(parolaOgg) {
    // 1. Creazione Header (Logica già pulita)
    const header = document.createElement('h1');
    header.innerText = parolaOgg.userData.testoHeader; // Prende la parola pulita
    header.style.cssText = "position:absolute; top:120px; left:50%; transform:translateX(-50%); color:white; font-family:'Montserrat', sans-serif; font-weight:900; z-index:10002; letter-spacing: 15px; font-size: 3.5rem; cursor: pointer; text-shadow: 0 0 20px rgba(255,255,255,0.5);";
    container.appendChild(header);
    header.addEventListener('click', () => tornaAlleFrasi());

    // 2. SPEGNIMENTO (Nascondiamo l'ellissoide e il monumento)
    gruppoEllissoidi.visible = false;
    if (totem) totem.visible = false;
    if (typeof sistemaStellato !== 'undefined') sistemaStellato.visible = false;

    // 3. CREAZIONE GRIGLIA (Assicurati che sia nella SCENA)
    creaQuadraturaCommenti(parolaOgg.position);

    // 4. VOLO CAMERA (Atterraggio sulla griglia)
        targetCameraPos = { 
            x: 0, 
            y: -2,  // Quasi sopra il piano della griglia (che è a -15)
            z: 18   // Distanza ravvicinata per vedere bene i dettagli
        };
    targetY = -15; // Guardiamo il piano della griglia
    isTransitioning = true;
}



    function creaAvatarCommento(posizionePunto, immagineUrl = null) {
    // Creiamo un cerchio piatto che guarda sempre la camera
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Disegniamo il cerchio bianco (bordo)
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Disegniamo il cerchio interno (colore placeholder se non c'è immagine)
    ctx.beginPath();
    ctx.arc(64, 64, 55, 0, Math.PI * 2);
    ctx.fillStyle = "#D4AF37"; // Oro come le frasi
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const avatar = new THREE.Sprite(spriteMaterial);

    // Posizioniamo l'avatar leggermente SOPRA il punto della griglia
    avatar.position.set(posizionePunto.x, posizionePunto.y + 0.8, posizionePunto.z);
    avatar.scale.set(1.2, 1.2, 1.2);
    
    avatar.userData = { tipo: "avatar", cliccabile: true };

    // Una linea sottile che collega l'avatar al punto della griglia
    const lineaGeometria = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.8, 0)
    ]);
    const lineaMateriale = new THREE.LineBasicMaterial({ color: 0xffffff });
    const stelo = new THREE.Line(lineaGeometria, lineaMateriale);
    avatar.add(stelo); // Lo stelo si muoverà insieme all'avatar

    // Dentro creaAvatarCommento, prima del return avatar;
    const geometryClick = new THREE.SphereGeometry(0.6, 8, 8);
    const materialClick = new THREE.MeshBasicMaterial({ visible: false }); // Invisibile ma cliccabile
    const zonaClick = new THREE.Mesh(geometryClick, materialClick);
    avatar.add(zonaClick); 


    return avatar;
}


    function avviaVoloGeodetico(faro) {
        const guscioID = faro.userData.guscioIndex;
        // Punto di intersezione tra piano geodetica e asse ellissoide
        const quotaGuscio = (guscioID * 10) - 10;
        const fuocoAsse = new THREE.Vector3(0, quotaGuscio, 0);

        if (totem) totem.visible = false;
        
        gruppoEllissoidi.children.forEach(child => {
            if (child.userData.guscioPadre === guscioID) {
                child.visible = true;
                child.material.opacity = 1;
                child.userData.cliccabile = true;
            }
            if (child.userData.tipo === "faro_inizio") child.visible = false;
        });

        // CALCOLO AVVICINAMENTO:
        // Prendiamo la posizione attuale della camera
        const posAttuale = camera.position.clone();
        
        // Calcoliamo il vettore che va dalla camera al fuoco dell'asse
        const vettoreVersoFuoco = fuocoAsse.clone().sub(posAttuale);
        
        // Ci muoviamo lungo questa retta, fermandoci a una distanza ragionevole (Distanza 18)
        const distanzaTarget = 18;
        const puntoAttracco = fuocoAsse.clone().add(
            vettoreVersoFuoco.clone().normalize().multiplyScalar(-distanzaTarget)
        );

        targetCameraPos = { 
            x: puntoAttracco.x, 
            y: puntoAttracco.y + 4, // Rialziamo leggermente per la prospettiva "da sopra"
            z: puntoAttracco.z 
        };
        
        targetY = quotaGuscio; 
        isTransitioning = true;
    }









    // Variabili per l'animazione della camera


    function animate() {
        requestAnimationFrame(animate);
        tempo += 0.01; 

        if (!isTransitioning) {
            // 1. MOVIMENTO LUCE (Ombreggiature mobili e riflessi)
            if (typeof luceMobile !== 'undefined') {
                luceMobile.position.x = Math.sin(tempo * 0.8) * 20;
                luceMobile.position.y = Math.cos(tempo * 0.5) * 15;
                luceMobile.position.z = 10 + Math.sin(tempo * 0.3) * 5;
            }

            // 2. ROTAZIONE MONUMENTO
            if (typeof totem !== 'undefined') {
                totem.rotation.y += 0.002;
            }

            if (typeof sistemaStellato !== 'undefined') {
            sistemaStellato.rotation.y += 0.0002;
            sistemaStellato.rotation.x += 0.0001;
            }


            // 4. FLUTTUAZIONE LEGGERISSIMA (Fari e punti)
            // Dentro animate(), nel blocco !isTransitioning
            gruppoEllissoidi.children.forEach((child) => {
                if (child.userData.tipo === "faro_inizio" && child.userData.raggi) {
                    // I raggi ruotano e "vibrano" in opacità
                    child.userData.raggi.rotation.z += 0.01;
                    child.userData.raggi.children.forEach(r => {
                        if(r.material) r.material.opacity = 0.2 + Math.sin(tempo * 5 + Math.random()) * 0.3;
                    });
                }
            });


             } else if (targetCameraPos) {
        camera.position.lerp(new THREE.Vector3(targetCameraPos.x, targetCameraPos.y, targetCameraPos.z), 0.05);
        
        // Se siamo nei commenti, il mirino è fisso sul piano -15
        camera.lookAt(0, targetY, 0); 
    }

        // UNICO RENDER FINALE
        renderer.render(scena, camera);
    }



    animate();

    // Gestione ridimensionamento finestra
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log("Sistema Commenti inizializzato: Scena pronta.");


function creaQuadraturaCommenti(posizioneParola) {
    const gruppoGriglia = new THREE.Group();
    gruppoGriglia.name = "gruppoGriglia";
    scena.add(gruppoGriglia); // AGGIUNGIAMO ALLA SCENA, NON AL GRUPPO


        // Parametri quadratura
        const righe = 8;
        const colonne = 8;
        const spaziatura = 2;

        // Decidiamo se metterla a destra o sinistra in base a dove abbiamo cliccato
        const offsetLato = posizioneParola.x > 0 ? -10 : 10;

        for (let i = 0; i < righe; i++) {
            for (let j = 0; j < colonne; j++) {
                // Calcolo posizione piatta (vista dall'alto)
                const x = (i * spaziatura) + offsetLato;
                const z = (j * spaziatura) - (righe * spaziatura / 2);
                const y = -15; // Griglia piatta

                // Il punto della quadratura (Punto Caldo)
                const geometryPunto = new THREE.SphereGeometry(0.1, 16, 16);
                const materialPunto = new THREE.MeshBasicMaterial({ 
                    color: 0xffcc80, 
                    transparent: true, 
                    opacity: 0.8 
                });
                const punto = new THREE.Mesh(geometryPunto, materialPunto);
                punto.position.set(x, y, z);
                
                // Dati del punto per i commenti futuri
                punto.userData = { tipo: 'slot-commento', id: `c-${i}-${j}` };
                gruppoGriglia.add(punto);

                if (Math.random() > 0.8) {
                const avatar = creaAvatarCommento(punto.position);
                gruppoGriglia.add(avatar);
                }

                // Aggiungiamo le linee della quadratura (fioche)
                if (i < righe - 1) { // Linea orizzontale
                    creaLinea(punto.position, new THREE.Vector3(x + spaziatura, y, z), gruppoGriglia);
                }
                if (j < colonne - 1) { // Linea verticale
                    creaLinea(punto.position, new THREE.Vector3(x, y, z + spaziatura), gruppoGriglia);
                }
            }
        }

        // Animazione di apparizione: facciamo sparire l'ellissoide
        gruppoEllissoidi.visible = false; 
    }

    // Funzione di supporto per disegnare le linee della griglia
    function creaLinea(inizio, fine, gruppo) {
        const materialeLinea = new THREE.LineBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.1 });
        const geometriaLinea = new THREE.BufferGeometry().setFromPoints([inizio, fine]);
        const linea = new THREE.Line(geometriaLinea, materialeLinea);
        gruppo.add(linea);
    }

    function apriDiscussione(avatarOgg) {
        // Creazione Overlay (lo sfondo scuro)
        const overlay = document.createElement('div');
        overlay.className = "overlay-dinamico";
        overlay.style.cssText = "position:absolute; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:20000; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.4s;";
        
        // Struttura del Box
        overlay.innerHTML = `
            <div class="comment-box" style="width:450px; padding:40px; background:#111; border:1px solid #D4AF37; border-radius:2px; color:white; font-family:'Montserrat', sans-serif; box-shadow: 0 30px 60px rgba(0,0,0,1); position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
                    <h2 style="margin:0; font-size:0.8rem; letter-spacing:4px; color:#D4AF37;">DISCUSSIONE</h2>
                    <span class="chiudi-btn" style="cursor:pointer; font-size:2rem; line-height:0.5;">&times;</span>
                </div>
                <p style="line-height:2; color:#fff; font-size:1.1rem; font-weight:300; margin-bottom:40px;">
                    "L'opera sembra vibrare in questo punto. La connessione tra la parola e la griglia crea una tensione spaziale magnifica."
                </p>
                <div style="border-top:1px solid #333; padding-top:20px;">
                    <input type="text" placeholder="SCRIVI UN PENSIERO..." style="width:100%; background:transparent; border:none; border-bottom:1px solid #D4AF37; color:white; padding:10px 0; font-family:'Montserrat'; outline:none; font-size:0.7rem; letter-spacing:2px;">
                </div>
            </div>
        `;

        container.appendChild(overlay);
        setTimeout(() => overlay.style.opacity = "1", 50);

        // GESTORE CLICK UNICO (Delegazione)
        overlay.addEventListener('click', (e) => {
            // Se clicchi sulla X o fuori dal box (sull'overlay stesso)
            if (e.target.classList.contains('chiudi-btn') || e.target === overlay) {
                overlay.style.opacity = "0";
                setTimeout(() => overlay.remove(), 400);
            }
        });
    }





    window.resetCommenti = tornaAlleFrasi;


  }

