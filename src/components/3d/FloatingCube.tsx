
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export const FloatingCube = () => {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#6366f1"
        opacity={0.6}
        transparent
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  );
};
