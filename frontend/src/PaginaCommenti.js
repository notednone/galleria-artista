import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function SculturaPolinomiale() {
  const meshRef = useRef();
  
  // Deformazione polinomiale semplificata (senza loop pesanti)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.2;
    if (meshRef.current) {
      meshRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]} position={[0, -5, -20]}>
      {/* 20x20 segmenti: molto leggero per la tua scheda video */}
      <planeGeometry args={[60, 60, 20, 20]} /> 
      <meshBasicMaterial 
        wireframe 
        color="#ffffff" 
        transparent 
        opacity={0.1} 
      />
    </mesh>
  );
}

function ParolaPoetica({ testo, pos, delay, zoom }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 1.1 + delay) * 0.5;
      ref.current.quaternion.copy(new THREE.Quaternion());
    }
  });

  return (
    <Text
      ref={ref}
      position={pos}
      fontSize={6}
      color="white"
      // Usiamo solo font di sistema sicuri per evitare il crash WebGL
      fontFamily="Impact, Arial Black, sans-serif" 
    >
      {zoom ? "" : testo}
    </Text>
  );
}

export default function PaginaCommenti() {
  const [zoom, setZoom] = useState(false);

  const frasi = [
    { testo: "Echi", pos: [-30, 10, -40], delay: 0 },
    { testo: "di", pos: [0, -2, -25], delay: 0.8 },
    { testo: "polvere", pos: [30, 15, -50], delay: 1.5 }
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'fixed', top: 0, left: 0, zIndex: 10 }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 10, 80]} fov={50} />
        <ambientLight intensity={1.5} />
        
        <SculturaPolinomiale />

        {frasi.map((f, i) => (
          <ParolaPoetica key={i} {...f} zoom={zoom} />
        ))}
      </Canvas>
    </div>
  );
}
