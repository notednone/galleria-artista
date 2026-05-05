import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Scena3D from './Scena3D';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { initPaginaCommenti } from './PaginaCommenti';
import { gsap } from 'gsap'




function SezioneCommenti() {
  useEffect(() => {
    // Pulizia: se c'è già qualcosa nel contenitore, svuotalo prima di iniziare
    const container = document.getElementById('comment-section-container');
    if (container) container.innerHTML = ''; 

    const timer = setTimeout(() => {
      initPaginaCommenti();
    }, 50); // Un po' più di respiro per il DOM
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      id="comment-section-container" 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'black', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 9999 // Alziamo lo z-index per essere sicuri che sia sopra tutto
      }}
    >
    </div>
  );
}


function SezioneContatti() {
  const avviaAnimazione = () => {
    };


  return (
    <div style={{ 
      width: '100vw', height: '100vh', background: '#0a192f', 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      position: 'fixed', top: 0, left: 0, zIndex: 9999 
    }}>
      
      <svg id="araldica-svg" viewBox="0 0 600 600" style={{ width: '90%', maxHeight: '90vh', overflow: 'visible' }}>
        {/* Qui domani inseriremo l'asset professionale */}
        <text 
          x="300" y="300" 
          textAnchor="middle" 
          fill="#f9f7f2" 
          style={{ fontFamily: 'serif', fontSize: '18px' }}
        >
          Pronti per la nuova configurazione...
        </text>
      </svg>
      
    </div>
  );
}







function App() {
  const [opere, setOpere] = useState([]);
  const [immagineSelezionata, setImmagineSelezionata] = useState(null);
  const [mostraNav, setMostraNav] = useState(true);
  const [vistaGriglia, setVistaGriglia] = useState(false);
  const galleriaRef = useRef(null);

  // Caricamento dati da Django
  useEffect(() => {
    fetch('http://localhost:8000/api/opere/')
      .then(response => response.json())
      .then(data => setOpere(data))
      .catch(err => console.error("Errore nel caricamento:", err));
  }, []);

  // Gestione visibilità Navbar allo scroll
  useEffect(() => {
    const handleScroll = () => {
      setMostraNav(window.pageYOffset < 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGallery = () => {
    galleriaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


    return (
    <Router>
      <div className="main-container">
        {/* rimosso Scena3D da qui per non sovrapporsi ai commenti */}

{mostraNav && !immagineSelezionata && (
  <nav className="navbar-elegante">
    <div className="nav-links">
      <Link to="/" style={{ color: 'inherit', textDecoration: 'none', marginRight: '20px' }}>
        GALLERIA
      </Link>
      
      <Link 
        to="/commenti" 
        style={{ color: 'inherit', textDecoration: 'none', marginRight: '20px' }}
        onClick={() => {
          if (typeof window.resetCommenti === "function") {
            window.resetCommenti();
          }
        }}
      >
        COMMENTI
      </Link>

      <span style={{ marginRight: '20px', cursor: 'pointer' }}>SU DI ME</span>

      {/* Link ai Contatti sistemato in stile React */}
      <Link to="/contatti" style={{ color: 'inherit', textDecoration: 'none' }}>
        CONTATTI
      </Link>
    </div>
  </nav>
)}


        <Routes>
          {/* PAGINA 1: LA HOME */}
          <Route path="/" element={
            <>
              {/* INNESTO: Scena3D ora vive solo nella Home */}
              <Scena3D 
                immagineSelezionata={immagineSelezionata} 
                setImmagineSelezionata={setImmagineSelezionata} 
              />

              <section className="landing">
                <h1 className="artista-nome">NOME ARTISTA</h1>
                <p className="citazione-principale">
                  "L'arte scuote dall'anima la polvere accumulata nella vita di tutti i giorni."
                </p>
                <button className="bottone-galleria" onClick={scrollToGallery}>
                  GALLERIA
                </button>
              </section>

{/* ... resto del codice sopra (Navbar, ecc.) ... */}

<div ref={galleriaRef}> {/* Questo è l'inizio della tua sezione galleria */}
  
  {/* 1. INSERISCI QUI IL TASTO TOGGLE */}
  <div className="container-toggle">
    <button className="bottone-toggle" onClick={() => setVistaGriglia(!vistaGriglia)}>
      {vistaGriglia ? "VISTA MONUMENTALE" : "VISTA GRIGLIA"}
    </button>
  </div>

  {/* 2. AGGIUNGI IL WRAPPER DEL LAYOUT CHE CAMBIA */}
  <div className={vistaGriglia ? "layout-griglia" : "layout-monumentale"}>
    {opere.map((opera) => (
      <section key={opera.id} className={vistaGriglia ? "card-opera-griglia" : "galleria-section"}>
        
        <div className="lato-sinistro">
          <img 
            src={opera.immagine} 
            alt={opera.titolo} 
            className="immagine-opera"
            onClick={() => setImmagineSelezionata(opera.immagine)}
            style={{ cursor: 'zoom-in' }}
          />
        </div>

        {/* 3. QUESTO BLOCCO APPARE SOLO SE NON SIAMO IN GRIGLIA */}
        {!vistaGriglia && (
          <>
            <div className="divisore-sfumato"></div>
            <div className="lato-destro">
              <h3 className="citazione-opera">{opera.citazione_breve}</h3>
              <p className="descrizione-opera">{opera.descrizione}</p>
            </div>
          </>
        )}

      </section>
    ))}
  </div>
</div>


            </>
          } />
          <Route path="/commenti" element={<SezioneCommenti />} />
          <Route path="/contatti" element={<SezioneContatti />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
