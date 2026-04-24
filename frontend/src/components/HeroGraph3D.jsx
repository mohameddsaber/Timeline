import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Line, Icosahedron } from '@react-three/drei';

const Node = ({ position, scale = 1, isRoot = false }) => {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Icosahedron args={[0.5 * scale, 0]} position={position}>
        <meshPhysicalMaterial 
          color="#18181b" // zinc-900 base
          emissive="#22d3ee" // cyan-400
          emissiveIntensity={isRoot ? 0.8 : 0.4}
          transmission={0.9}
          opacity={1}
          metalness={0.9}
          roughness={0.1}
          ior={1.5}
          thickness={1}
        />
      </Icosahedron>
    </Float>
  );
};

const HeroGraph3D = () => {
  // Define node positions
  const nodes = [
    [0, 1.5, 0],    // 0: Top Center (Root)
    [-1.8, 0.2, 0.5], // 1: Mid Left
    [1.8, -0.2, -0.5], // 2: Mid Right
    [-1.2, -1.5, 1],  // 3: Bottom Left
    [1.2, -1.8, -1]   // 4: Bottom Right
  ];

  // Define edges (pairs of indices)
  const edges = [
    [0, 1], // Root to Mid Left
    [0, 2], // Root to Mid Right
    [1, 3], // Mid Left to Bottom Left
    [1, 4], // Mid Left to Bottom Right
    [2, 4], // Mid Right to Bottom Right
  ];

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#22d3ee" />
        
        {/* Render Edges */}
        {edges.map((edge, idx) => (
          <Line
            key={idx}
            points={[nodes[edge[0]], nodes[edge[1]]]}
            color="#22d3ee"
            lineWidth={1.5}
            transparent
            opacity={0.25}
            dashed={false}
          />
        ))}

        {/* Render Nodes */}
        {nodes.map((pos, idx) => (
          <Node key={idx} position={pos} scale={idx === 0 ? 1.3 : 1} isRoot={idx === 0} />
        ))}

        {/* Controls */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
};

export default HeroGraph3D;
