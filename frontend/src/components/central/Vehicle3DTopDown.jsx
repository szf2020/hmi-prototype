import React, { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useHMI } from '../../contexts/HMIContext';

// Model-specific scale and position configurations (same as Vehicle3D)
const MODEL_SCALE_CONFIG = {
  '/models/vehicle.glb': {
    targetSize: 4.5,
    positionOffset: { x: 6.7, y: 0, z: -0.5 },
    rotation: { x: 0, y: -0.5, z: 0 },
  },
  '/models/dodge.glb': {
    targetSize: 4.3,
    positionOffset: { x: 0, y: -0.7, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  '/models/tpz-fuchs.glb': {
    targetSize: 4.1,
    positionOffset: { x: 0.15, y: 1.9, z: 0 },
    rotation: { x: 0, y: -90, z: 0 },
  },
};

const DEFAULT_TARGET_SIZE = 5.0;
const DEFAULT_POSITION_OFFSET = { x: 0, y: 0, z: 0 };
const DEFAULT_ROTATION = { x: 0, y: 0, z: 0 };

// Simplified vehicle model component for top-down view
function VehicleModelTopDown({ modelPath = '/models/vehicle.glb' }) {
  const meshRef = useRef();
  const centeredRef = useRef(false);
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    centeredRef.current = false;
  }, [modelPath]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        const material = new THREE.MeshStandardMaterial({
          color: 'rgb(94, 94, 94)',
          metalness: 0.8,
          roughness: 0.3,
        });
        
        child.material = Array.isArray(child.material)
          ? child.material.map(() => material.clone())
          : material;
      }
    });
    
    return cloned;
  }, [scene]);

  useFrame(() => {
    if (meshRef.current && !centeredRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const modelConfig = MODEL_SCALE_CONFIG[modelPath];
      const targetSize = modelConfig ? modelConfig.targetSize : DEFAULT_TARGET_SIZE;
      const positionOffset = modelConfig ? modelConfig.positionOffset : DEFAULT_POSITION_OFFSET;
      const rotation = modelConfig ? modelConfig.rotation : DEFAULT_ROTATION;
      
      meshRef.current.position.x = -center.x + positionOffset.x;
      meshRef.current.position.y = -center.y + positionOffset.y;
      meshRef.current.position.z = -center.z + positionOffset.z;
      
      meshRef.current.rotation.x = (rotation.x * Math.PI) / 180;
      meshRef.current.rotation.y = (rotation.y * Math.PI) / 180 + Math.PI; // Add 180 deg rotation for top-down view
      meshRef.current.rotation.z = (rotation.z * Math.PI) / 180;
      
      const maxSize = Math.max(size.x, size.y, size.z);
      const scale = targetSize / maxSize;
      meshRef.current.scale.set(scale, scale, scale);
      
      centeredRef.current = true;
    }
  });

  return (
    <primitive 
      object={clonedScene} 
      ref={meshRef}
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

// Fallback component
function VehicleFallback() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.2, 2]} />
        <meshStandardMaterial color="rgb(100, 100, 100)" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.5, 0.8, 1.8]} />
        <meshStandardMaterial color="rgb(100, 100, 100)" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Vehicle3DTopDown() {
  const { state } = useHMI();
  const [modelExists, setModelExists] = useState(true);
  const modelPath = state.selected3DModel || '/models/vehicle.glb';

  useEffect(() => {
    // Reset to true when model path changes, then verify
    setModelExists(true);
    fetch(modelPath, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) setModelExists(false);
      })
      .catch(() => setModelExists(false));
  }, [modelPath]);

  return (
    <div className="vehicle-3d-topdown">
      <Canvas
        camera={{
          position: [0, 8, 0], // Top-down view
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        onCreated={(canvasState) => {
          canvasState.gl.setClearColor('#000000', 0);
          canvasState.camera.lookAt(0, 0, 0);
        }}
      >
        <Environment preset="city" />
        <ambientLight intensity={2.0} color="rgb(188, 217, 255)" />
        <directionalLight position={[0, 10, 0]} intensity={2.0} color="#D2DCFF" />
        <directionalLight position={[5, 5, 5]} intensity={3.0} color="rgb(87, 96, 131)" />
        
        <ErrorBoundary fallback={<VehicleFallback />}>
          <Suspense fallback={<VehicleFallback />}>
            {modelExists ? (
              <VehicleModelTopDown modelPath={modelPath} />
            ) : (
              <VehicleFallback />
            )}
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}

export default Vehicle3DTopDown;

