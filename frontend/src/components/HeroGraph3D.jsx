import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const generateRadialGraph = () => {
  const nodes = [];
  const edges = [];
  
  nodes.push([0, 0, 0]); // Root Core
  
  let nodeIndex = 1;
  const layers = [
    { count: 12, radius: 0.8, parentRange: [0, 0] },
    { count: 28, radius: 1.8, parentRange: [1, 12] },
    { count: 64, radius: 3.2, parentRange: [13, 40] },
  ];

  layers.forEach((layer, layerIdx) => {
    const angleStep = (Math.PI * 2) / layer.count;
    
    for (let i = 0; i < layer.count; i++) {
      const currentAngle = i * angleStep;
      const noiseAngle = currentAngle + (Math.random() - 0.5) * (angleStep * 0.9);
      const noiseRadius = layer.radius + (Math.random() - 0.5) * 0.6;
      
      const x = Math.cos(noiseAngle) * noiseRadius;
      const y = Math.sin(noiseAngle) * noiseRadius;
      const z = (Math.random() - 0.5) * 1.5; // Depth variance
      
      nodes.push([x, y, z]);
      
      let parentId = 0;
      if (layerIdx > 0) {
        const pRange = layer.parentRange;
        const parentCount = pRange[1] - pRange[0] + 1;
        const ratio = layer.count / parentCount;
        parentId = pRange[0] + Math.floor(i / ratio);
      }
      
      edges.push([parentId, nodeIndex]);
      
      // Occasionally connect to a sibling for a more web-like feel
      if (Math.random() > 0.85 && i > 0) {
        edges.push([nodeIndex - 1, nodeIndex]);
      }

      nodeIndex++;
    }
  });

  return { nodes, edges };
};

const Node = ({ position, scale = 1, isRoot = false }) => {
  return (
    <Float speed={1.5} rotationIntensity={isRoot ? 0 : 2} floatIntensity={1}>
      <Sphere args={[0.06 * scale, 16, 16]} position={position}>
        <meshPhysicalMaterial
          color="#18181b"
          emissive="#22d3ee"
          emissiveIntensity={isRoot ? 3 : Math.random() * 0.8 + 0.2}
          transmission={0.9}
          opacity={1}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
    </Float>
  );
};

const HeroGraph3D = () => {
  const { nodes, edges } = useMemo(() => generateRadialGraph(), []);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#22d3ee" />
        
        {/* Render Edges as glowing nerves */}
        {edges.map((edge, idx) => (
          <Line
            key={`edge-${idx}`}
            points={[nodes[edge[0]], nodes[edge[1]]]}
            color="#22d3ee"
            lineWidth={isRootConnection(edge) ? 2 : 1}
            transparent
            opacity={isRootConnection(edge) ? 0.4 : 0.15}
          />
        ))}

        {/* Render Nodes */}
        {nodes.map((pos, idx) => (
          <Node
            key={`node-${idx}`}
            position={pos}
            scale={idx === 0 ? 3 : 1 + Math.random()} 
            isRoot={idx === 0}
          />
        ))}

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
};

// Helper to highlight core lines
const isRootConnection = (edge) => edge[0] === 0;

export default HeroGraph3D;