import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Scena3D from './Scena3D';

function App() {
  const [opere, setOpere] = useState([]);
  const [immagineSelezionata, setImmagineSelezionata] = useState(null);
  const [mostraNav, setMostraNav] = useState(true);
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
    <div className="main-container">
      {/* 
        Passiamo l'immagine e la funzione di chiusura a Scena3D.
        Ora il 3D gestisce sia lo sfondo che il fullscreen (Saturno Mode).
      */}
      <Scena3D 
        immagineSelezionata={immagineSelezionata} 
        setImmagineSelezionata={setImmagineSelezionata} 
      />

      {/* NAVBAR ELEGANTE - Scompare dopo la prima scrollata */}
      {mostraNav && !immagineSelezionata && (
        <nav className="navbar-elegante">
          <div className="nav-links">
            <span>SU DI ME</span>
            <span>CONTATTI</span>
          </div>
        </nav>
      )}

      {/* SEZIONE 1: LANDING PAGE */}
      <section className="landing">
        <h1 className="artista-nome">NOME ARTISTA</h1>
        <p className="citazione-principale">
          "L'arte scuote dall'anima la polvere accumulata nella vita di tutti i giorni."
        </p>
        <button className="bottone-galleria" onClick={scrollToGallery}>
          GALLERIA
        </button>
      </section>

      {/* SEZIONE 2: GALLERIA DINAMICA */}
      <div ref={galleriaRef}>
        {opere.map((opera) => (
          <section key={opera.id} className="galleria-section">
            
            <div className="lato-sinistro">
              <img 
                src={opera.immagine} 
                alt={opera.titolo} 
                className="immagine-opera"
                onClick={() => setImmagineSelezionata(opera.immagine)}
                style={{ cursor: 'zoom-in' }}
              />
            </div>

            <div className="divisore-sfumato"></div>

            <div className="lato-destro">
              <h3 className="citazione-opera">{opera.citazione_breve}</h3>
              <p className="descrizione-opera">{opera.descrizione}</p>
            </div>

          </section>
        ))}
      </div>
    </div>
  );
}

export default App;
