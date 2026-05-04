import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';


function SolidoGeometrico() {
  const meshRef = useRef();
  const [scrollPos, setScrollPos] = useState(0);

  // 1. GESTIONE SCROLL: Cattura il movimento della rotella
  useEffect(() => {
    const handleScroll = (e) => {
      // 0.0008 è il punto di equilibrio: scorre abbastanza da sentirlo, 
      // ma non scappa via come una trottola.
      setScrollPos(prev => prev + e.deltaY * 0.0008);
    };
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);



  const rotazioneLenta = useRef(0); // Memorizziamo la rotazione "morbida"
 
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // INERZIA CALIBRATA
      // Il valore 0.07 garantisce che la sfera segua lo scorrimento 
      // con una "coda" di movimento molto morbida ma reattiva.
      rotazioneLenta.current = THREE.MathUtils.lerp(
        rotazioneLenta.current, 
        scrollPos, 
        0.07 
      );

      // Applichiamo lo scorrimento all'asse Y
      meshRef.current.rotation.y = rotazioneLenta.current + t * 0.05;
      // Una rotazione costante minima sull'asse X per dare tridimensionalità
      meshRef.current.rotation.x = t * 0.02;

      // 3. CICLO COLORI (Manteniamo quello che avevamo)
      const cycle = (Math.sin(t * 0.5) + 1) / 2;
      const colGrigio = new THREE.Color(0x888888);
      const colRosso = new THREE.Color(0xff0000);
      const colVerde = new THREE.Color(0x00ff00);

      let coloreFinale = cycle < 0.5 
        ? colGrigio.clone().lerp(colRosso, cycle * 2) 
        : colRosso.clone().lerp(colVerde, (cycle - 0.5) * 2);
        
      meshRef.current.material.color = coloreFinale;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0.6, 0, 0.3]} scale={[2.5, 2.5, 2.5]}>
      <icosahedronGeometry args={[1, 3]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
    </mesh>
  );
}

function SaturnoMode({ immagine, alChiusura }) {
  const groupRef = useRef();

  // 1. Il materiale originale (Symphony Shader)
  const symphonyMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0x00d4ff) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec3 baseColor;
      void main() {
        float fastTime = time * 2.5; 
        float rhythmicTime = floor(fastTime) + pow(fract(fastTime), 0.5); 
        
        // 1. PULSE BILANCIATO: non scende mai a 0 (minimo 0.2) e non arriva a 1 (massimo 0.8)
        float pulse = mix(0.2, 0.8, pow(sin(rhythmicTime) * 0.5 + 0.5, 10.0)); 

        float v1 = sin(vUv.x * 2.0 - time * 0.7);
        float v2 = sin(vUv.x * 5.0 + time * 0.3);
        float harmony = (v1 * 0.5 + v2 * 0.5);
        
        // 2. WAVE PULSE: gli diamo una base costante così i tubi sono sempre visibili
        float wavePulse = mix(0.15, 1.0, pow(harmony * 0.5 + 0.5, 3.0)) * pulse;

        float groove = smoothstep(0.2, 0.5, vUv.y) * smoothstep(0.8, 0.5, vUv.y);
        
        // Colore di base leggermente più luminoso
        vec3 colorA = vec3(0.0, 0.08, 0.25); 
        vec3 finalLight = mix(colorA, baseColor, wavePulse);
        
        // 3. TAGLIO DEI PICCHI: ridotto l'esponente e l'intensità per non accecare
        finalLight += vec3(0.6) * pow(wavePulse, 4.0) * 0.8; 

        // Glow più ampio ma meno denso
        float glow = exp(-abs(vUv.y - 0.5) * 4.0) * wavePulse * 0.5;
        
        gl_FragColor = vec4(finalLight * groove + (baseColor * glow), 1.0);
      }

    `,
    side: THREE.DoubleSide
  }), []);

  // 2. Costruzione della geometria a "Tubi" (L'originale)
  const tubi = useMemo(() => {
    const meshes = [];
    const dodecaGeo = new THREE.DodecahedronGeometry(5.5); // Grande come chiesto
    const edges = new THREE.EdgesGeometry(dodecaGeo);
    const posAttr = edges.attributes.position;

    for (let i = 0; i < posAttr.count; i += 2) {
      const start = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      const end = new THREE.Vector3(posAttr.getX(i+1), posAttr.getY(i+1), posAttr.getZ(i+1));
      const path = new THREE.LineCurve3(start, end);
      // Creiamo i tubi per ogni spigolo
      const tubeGeo = new THREE.TubeGeometry(path, 20, 0.15, 8, false);
      meshes.push(tubeGeo);
    }
    return meshes;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    symphonyMaterial.uniforms.time.value = t;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group>
      <Html center>
        <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={alChiusura}>
          <img src={immagine} style={{ maxHeight: '80vh', maxWidth: '60vw', boxShadow: '0 0 100px #000', cursor: 'zoom-out', zIndex: 10 }} />
        </div>
      </Html>

      <group ref={groupRef}>
        {tubi.map((geo, idx) => (
          <mesh key={idx} geometry={geo} material={symphonyMaterial} />
        ))}
      </group>
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

// Cerca questa parte in fondo al file Scena3D.js
return (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: immagineSelezionata ? 9999 : -1, background: immagineSelezionata ? '#050505' : 'transparent' }}>
    
    {/* MODIFICA IL TAG CANVAS COME SEGUE */}
    <Canvas 
      gl={{ 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.5 
      }} 
      camera={{ position: [0, 0, 12], fov: 50 }}
    >
      {!immagineSelezionata ? (
        <SolidoGeometrico /> 
      ) : (
        <SaturnoMode immagine={immagineSelezionata} alChiusura={() => setImmagineSelezionata(null)} />
      )}
    </Canvas>

  </div>
);

}
