// components/hero/Hero3D.tsx
'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

// ── Floating prism grid ───────────────────────────────────────────────────────
function PrismNode({ position, color, speed = 1 }: { position: [number,number,number]; color: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.15;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={color} wireframe emissive={color}
          emissiveIntensity={0.4} transparent opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

// ── Central distorted sphere ──────────────────────────────────────────────────
function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
  });
  return (
    <Sphere ref={meshRef} args={[1.1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#2563eb" attach="material"
        distort={0.38} speed={2.5}
        roughness={0.08} metalness={0.9}
        emissive="#06b6d4" emissiveIntensity={0.25}
        transparent opacity={0.82}
      />
    </Sphere>
  );
}

// ── Orbital rings ─────────────────────────────────────────────────────────────
function OrbitalRing({ radius, color, speed }: { radius: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
  });
  return (
    <Torus ref={ref} args={[radius, 0.015, 8, 80]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </Torus>
  );
}

// ── Particle field ────────────────────────────────────────────────────────────
function ParticleField({ count = 120 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#60a5fa" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ── Scene wrapper ─────────────────────────────────────────────────────────────
function Scene() {
  const nodes: Array<{ pos: [number,number,number]; color: string; speed: number }> = [
    { pos: [-2.4,  1.2, -0.5], color: '#06b6d4', speed: 0.9 },
    { pos: [ 2.6,  0.8, -0.8], color: '#7c3aed', speed: 1.1 },
    { pos: [-1.8, -1.5,  0.3], color: '#2563eb', speed: 0.75 },
    { pos: [ 2.0, -1.2,  0.6], color: '#10b981', speed: 1.2 },
    { pos: [ 0.4,  2.4, -0.4], color: '#f43f5e', speed: 0.85 },
    { pos: [-0.6, -2.3,  0.2], color: '#f59e0b', speed: 0.95 },
  ];

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 4, 3]}  color="#2563eb" intensity={3} />
      <pointLight position={[-3,-3,-2]} color="#7c3aed" intensity={2} />
      <pointLight position={[0, 0, 4]}  color="#06b6d4" intensity={1.5} />

      <ParticleField count={160} />
      <CoreSphere />
      <OrbitalRing radius={1.65} color="#2563eb" speed={0.5} />
      <OrbitalRing radius={2.10} color="#7c3aed" speed={-0.3} />
      <OrbitalRing radius={2.55} color="#06b6d4" speed={0.22} />
      {nodes.map((n, i) => <PrismNode key={i} position={n.pos} color={n.color} speed={n.speed} />)}
    </>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export default function Hero3D() {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
