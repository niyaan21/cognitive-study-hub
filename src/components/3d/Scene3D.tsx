
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FloatingCube } from './FloatingCube';

export const Scene3D = () => {
  return (
    <Canvas className="absolute inset-0 -z-10">
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingCube />
    </Canvas>
  );
};
