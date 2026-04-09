import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

function SolidoGeometrico({ scrollPos }) {
  const meshRef = useRef();
  useFrame(() => {
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y = scrollPos / 400;
  });
  return (
    <mesh ref={meshRef} rotation={[0.6, 0, 0.3]} scale={[2.5, 2.5, 2.5]}>
      <icosahedronGeometry args={[1, 3]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
    </mesh>
  );
}

function SaturnoMode({ immagine, alChiusura }) {
  const geomRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15; // Rallentata leggermente per eleganza
    const pos = geomRef.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // INCRESPATURA PIÙ LARGA: abbiamo diminuito i moltiplicatori (0.8) 
      // per rendere l'onda più "morbida" e ampia, e aumentato l'altezza (0.8)
      const z = Math.sin(x * 0.8 + t) * Math.cos(y * 0.8 + t) * 0.8;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      {/* IMMAGINE AL CENTRO */}
      <Html center distanceFactor={10}>
        <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={alChiusura}>
          <img src={immagine} style={{ maxHeight: '80vh', maxWidth: '60vw', boxShadow: '0 0 100px #000', cursor: 'zoom-out' }} />
        </div>
      </Html>

      {/* ANELLO ESPANSO */}
      <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, 0, -1]}>
        {/* RAGGIO ESTERNO PORTATO A 7.5: ora l'anello è molto più grande */}
        <ringGeometry ref={geomRef} args={[2.5, 7.5, 64, 30]} />
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.6} 
          side={2} 
        />
      </mesh>
    </group>
  );
}

export default function Scena3D({ immagineSelezionata, setImmagineSelezionata }) {
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPos(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: immagineSelezionata ? 9999 : -1, background: immagineSelezionata ? '#050505' : 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {!immagineSelezionata ? (
          <SolidoGeometrico scrollPos={scrollPos} />
        ) : (
          <SaturnoMode immagine={immagineSelezionata} alChiusura={() => setImmagineSelezionata(null)} />
        )}
      </Canvas>
    </div>
  );
}
