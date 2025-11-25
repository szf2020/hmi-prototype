import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Button from '../../design-system/components/Button/Button';
import './Vehicle3D.css';

// 3D Background - Ground Plane that pans with the car
function GroundPlane() {
  const meshRef = useRef();
  
  // Create bumpy geometry using useMemo
  const bumpyGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(50, 50, 100, 100);
    const positions = geometry.attributes.position.array;
    
    // Add bumpiness using noise-like displacement
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // Y in plane geometry becomes Z after rotation
      
      // Create bumpy surface using multiple sine waves for natural variation
      const bumpHeight = 0.1;
      const bump1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * bumpHeight;
      const bump2 = Math.sin(x * 0.8) * Math.cos(z * 0.8) * bumpHeight * 0.8;
      const bump3 = Math.sin(x * 1.5) * Math.cos(z * 1.5) * bumpHeight * 0.25;
      
      positions[i + 2] = bump1 + bump2 + bump3; // Modify Z position (height after rotation)
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals for proper lighting
    
    return geometry;
  }, []);
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[MODEL_X_OFFSET, -0.75, 0]}
      receiveShadow
      geometry={bumpyGeometry}
    >
      <meshStandardMaterial 
        color="#1C1F23"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

// Grid helper for depth perception
function GridHelper() {
  return (
    <gridHelper 
      args={[50, 50, '#2a2a3e', '#1a1a2e']} 
      position={[MODEL_X_OFFSET, -1.19, 0]}
    />
  );
}

// Background sphere for environment
function BackgroundSphere() {
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create vertical gradient from top to bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#000');    // Top - white
    gradient.addColorStop(0.3, '#000');  // Mid - white
    gradient.addColorStop(1, '#F69F58');    // Bottom - white
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial 
        map={gradientTexture}
        side={THREE.BackSide}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
}

// Component with 3D model loader
function VehicleModelWithFile({ modelPath = '/models/vehicle.glb', onPositionUpdate, onRoofPositionUpdate }) {
  const meshRef = useRef();
  const centeredRef = useRef(false);
  const boundingBoxRef = useRef(null);
  
  // Load the 3D model
  const { scene } = useGLTF(modelPath);

  // Memoize the cloned scene and apply enhanced shading
  // This prevents the model from jumping when parent components re-render
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Traverse the scene and apply black metallic material
    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        // Create black metallic material with blue and purple shine
        const blackMetallicMaterial = new THREE.MeshPhysicalMaterial({
          color: '#444', // Much lighter color for maximum brightness
          metalness: 1, // High metalness for metallic appearance
          roughness: 0.4, // Lower roughness for more reflectivity and brightness
          envMapIntensity: 0.7, // Reduced to minimize warm tones from environment map
          sheen: 0.5, // Enable sheen for additional reflectivity
          sheenColor: 'rgb(255, 255, 255)', //  Tint for the reflective shine (blue-purple)
          sheenRoughness: 0.35, // Smoother sheen for more brightness
          iridescence: 0, // No iridescence effect
        });
        
        // Replace all materials with black metallic material
        child.material = Array.isArray(child.material)
          ? child.material.map(() => blackMetallicMaterial.clone())
          : blackMetallicMaterial;
        
        // Ensure shadows are enabled
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return cloned;
  }, [scene]);

  // Center and scale the model using useFrame to ensure it runs after render
  useFrame(() => {
    if (meshRef.current && !centeredRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model and apply X offset to shift it right
      meshRef.current.position.x = -center.x + MODEL_X_OFFSET;
      meshRef.current.position.y = -center.y;
      meshRef.current.position.z = -center.z;
      
      // Scale to fit if needed - increased maxSize to prevent cropping
      const maxSize = Math.max(size.x, size.y, size.z);
      if (maxSize > 6) {
        const scale = 6 / maxSize;
        meshRef.current.scale.set(scale, scale, scale);
      }
      
      boundingBoxRef.current = box;
      centeredRef.current = true;
    }
    
    // Update position callback for button tracking - pin to tail of car
    if (meshRef.current && centeredRef.current && onPositionUpdate) {
      // Recalculate bounding box in world space to account for any transformations
      const box = new THREE.Box3().setFromObject(meshRef.current);
      
      // Get the back center point of the car (minimum Z, center X, center Y)
      const backPosition = new THREE.Vector3();
      const size = box.getSize(new THREE.Vector3());
      backPosition.x = (box.min.x + box.max.x) / 2; // Center X with rightward offset
      backPosition.y = (box.min.y + box.max.y) / 2 + 0.4; // Center Y
      backPosition.z = box.min.z; // Back edge (minimum Z)
      
      // Offset outward from the tail so button doesn't overlay the vehicle
      const direction = new THREE.Vector3(0, 0, -1); // Backward direction in local space
      direction.applyQuaternion(meshRef.current.quaternion); // Transform to world space
      backPosition.addScaledVector(direction, size.z * 0.1); // Offset outward to avoid overlay
      backPosition.y += size.y * 0.15; // Slight upward offset
      
      onPositionUpdate(backPosition);
    }
    
    // Update roof position callback for lock button tracking
    if (meshRef.current && centeredRef.current && onRoofPositionUpdate) {
      // Recalculate bounding box in world space to account for any transformations
      const box = new THREE.Box3().setFromObject(meshRef.current);
      
      // Get the roof center point (center X, maximum Y, center Z)
      const roofPosition = new THREE.Vector3();
      roofPosition.x = (box.min.x + box.max.x) / 2; // Center X
      roofPosition.y = box.max.y; // Top edge (maximum Y)
      roofPosition.z = (box.min.z + box.max.z) / 2; // Center Z
      
      // Offset upward from the roof so button doesn't overlay the vehicle
      const size = box.getSize(new THREE.Vector3());
      roofPosition.y += size.y * 0.2; // Offset upward to avoid overlay (reduced to shift button down)
      
      onRoofPositionUpdate(roofPosition);
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

// Fallback component with geometric car shape
function VehicleModelFallback({ onPositionUpdate, onRoofPositionUpdate }) {
  const meshRef = useRef();
  const centeredRef = useRef(false);
  const boundingBoxRef = useRef(null);

  // Center the fallback model using useFrame
  useFrame(() => {
    if (meshRef.current && !centeredRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      
      // Center the model and apply X offset to shift it right
      meshRef.current.position.x = -center.x + MODEL_X_OFFSET;
      meshRef.current.position.y = -center.y;
      meshRef.current.position.z = -center.z;
      
      boundingBoxRef.current = box;
      centeredRef.current = true;
    }
    
    // Update position callback for button tracking - pin to tail of car
    if (meshRef.current && centeredRef.current && onPositionUpdate) {
      // Recalculate bounding box in world space to account for any transformations
      const box = new THREE.Box3().setFromObject(meshRef.current);
      
      // Get the back center point of the car (minimum Z, center X, center Y)
      const backPosition = new THREE.Vector3();
      backPosition.x = (box.min.x + box.max.x) / 2; // Center X
      backPosition.y = (box.min.y + box.max.y) / 2; // Center Y
      backPosition.z = box.min.z; // Back edge (minimum Z)
      
      // Offset outward from the tail so button doesn't overlay the vehicle
      const size = box.getSize(new THREE.Vector3());
      const direction = new THREE.Vector3(0, 0, -1); // Backward direction in local space
      direction.applyQuaternion(meshRef.current.quaternion); // Transform to world space
      backPosition.addScaledVector(direction, size.z * 0.2); // Offset outward to avoid overlay
      backPosition.y += size.y * 0.1; // Slight upward offset
      
      onPositionUpdate(backPosition);
    }
    
    // Update roof position callback for lock button tracking
    if (meshRef.current && centeredRef.current && onRoofPositionUpdate) {
      // Recalculate bounding box in world space to account for any transformations
      const box = new THREE.Box3().setFromObject(meshRef.current);
      
      // Get the roof center point (center X, maximum Y, center Z)
      const roofPosition = new THREE.Vector3();
      roofPosition.x = (box.min.x + box.max.x) / 2; // Center X
      roofPosition.y = box.max.y; // Top edge (maximum Y)
      roofPosition.z = (box.min.z + box.max.z) / 2; // Center Z
      
      // Offset upward from the roof so button doesn't overlay the vehicle
      const size = box.getSize(new THREE.Vector3());
      roofPosition.y += size.y * 0.15; // Offset upward to avoid overlay (reduced to shift button down)
      
      onRoofPositionUpdate(roofPosition);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Car body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.2, 2]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      {/* Car roof */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.8, 1.8]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      {/* Wheels */}
      {[
        [-1.2, -0.6, 1.1],
        [1.2, -0.6, 1.1],
        [-1.2, -0.6, -1.1],
        [1.2, -0.6, -1.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// Error Boundary component for React Three Fiber
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('3D model failed to load, using fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Main component that tries to load model, falls back to geometry
function VehicleModel({ modelPath = '/models/vehicle.glb', onPositionUpdate, onRoofPositionUpdate }) {
  const [useModel, setUseModel] = useState(true);

  // Check if model file exists
  useEffect(() => {
    fetch(modelPath, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          setUseModel(false);
        }
      })
      .catch(() => {
        setUseModel(false);
      });
  }, [modelPath]);

  if (!useModel) {
    return <VehicleModelFallback onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} />;
  }

  return (
    <ErrorBoundary fallback={<VehicleModelFallback onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} />}>
      <Suspense fallback={null}>
        <VehicleModelWithFile modelPath={modelPath} onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} />
      </Suspense>
    </ErrorBoundary>
  );
}

const DEFAULT_DISTANCE = 3.8;
const DEFAULT_AZIMUTH = Math.PI / 4.5 ; // -30deg for a slight angle
const DEFAULT_POLAR = Math.PI / 2; // 45deg from "up" (down from y axis)
// Offset to shift model 128px to the right (converted to 3D units)
// Approximate conversion: with FOV 60 and distance 3.5, ~128px ≈ 0.5 units
const MODEL_X_OFFSET = 0.4; // Shift model to the right in 3D space

// Component to track 3D position and convert to screen coordinates
function PositionTracker({ positionRef, onScreenPositionUpdate }) {
  const { camera, size } = useThree();
  
  useFrame(() => {
    if (positionRef.current) {
      // Convert 3D position to screen coordinates
      const vector = positionRef.current.clone();
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (vector.y * -0.5 + 0.5) * size.height;
      
      // Only update if position is in front of camera (z < 1)
      if (vector.z < 1) {
        onScreenPositionUpdate({ x, y, visible: true });
      } else {
        onScreenPositionUpdate({ x, y, visible: false });
      }
    }
  });
  
  return null;
}

function Vehicle3D() {
  const controlsRef = useRef();
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, visible: false });
  const [lockButtonPosition, setLockButtonPosition] = useState({ x: 0, y: 0, visible: false });
  const vehiclePositionRef = useRef(new THREE.Vector3());
  const roofPositionRef = useRef(new THREE.Vector3());
  const [isLocked, setIsLocked] = useState(true);

  // Compute initial camera position in spherical coordinates for 45deg down from Y
  // and -30deg azimuth for a pleasing 3D view
  const getCameraPosition = (radius, polar, azimuth) => {
    // Spherical to Cartesian
    const x = radius * Math.sin(polar) * Math.cos(azimuth);
    const y = radius * Math.cos(polar);
    const z = radius * Math.sin(polar) * Math.sin(azimuth);
    return [x, y, z];
  };

  const cameraPosition = getCameraPosition(
    DEFAULT_DISTANCE,
    DEFAULT_POLAR,
    DEFAULT_AZIMUTH
  );

  const handleVehiclePositionUpdate = (position) => {
    vehiclePositionRef.current.copy(position);
  };

  const handleRoofPositionUpdate = (position) => {
    roofPositionRef.current.copy(position);
  };

  const handleOpenTailgate = () => {
    // TODO: Implement tailgate opening logic
    console.log('Opening tailgate...');
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
    // TODO: Implement lock/unlock logic
    console.log(isLocked ? 'Unlocking vehicle...' : 'Locking vehicle...');
  };

  // Tailgate icon SVG
  const tailgateIcon = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.833 25.8332C18.5944 25.8332 20.8329 28.0718 20.833 30.8332C20.833 33.5946 18.5944 35.8332 15.833 35.8332C13.0717 35.833 10.833 33.5945 10.833 30.8332C10.8331 28.072 13.0718 25.8334 15.833 25.8332ZM23.6699 4.20432L28.8701 4.78146C29.5043 4.85193 29.6868 5.6875 29.1396 6.01584L26.7656 7.44064C26.7002 7.47989 26.6285 7.50768 26.5537 7.52267L22.6982 8.29416C22.5693 8.31995 22.4505 8.38285 22.3574 8.4758L16.6572 14.175C19.5023 15.282 23.2872 17.0712 25.4668 18.1506C25.693 18.2627 25.8308 18.4933 25.8457 18.7453C25.9207 20.0162 26.3262 21.2216 26.7168 22.383C27.1162 23.5705 27.5 24.7126 27.5 25.8332C27.5 26.9443 27.1663 29.3335 25.833 30.0002C25.1855 30.3239 24.2495 30.5294 23.3311 30.6555C23.2366 26.5955 19.9157 23.3332 15.833 23.3332C11.6911 23.3334 8.33307 26.6912 8.33301 30.8332C8.33301 31.1137 8.3489 31.3908 8.37891 31.6633L8.33301 31.6662H5C4.0796 31.6662 3.33313 30.9206 3.33301 30.0002V14.1662C3.33324 13.246 4.07967 12.5002 5 12.5002H6.66699C8.61143 12.5002 11.5005 12.6666 14.167 13.3332C14.3522 13.3795 14.5543 13.4381 14.7715 13.5051L23.1045 4.41623C23.2482 4.25943 23.4585 4.18083 23.6699 4.20432Z" fill="white" fillOpacity="0.9"/>
      <path d="M32.3389 9.05639C31.2172 8.72443 30.0261 9.29461 29.581 10.3764L28.8576 12.1349C28.6856 12.5531 28.8856 13.0321 29.3038 13.2041C29.722 13.376 30.2001 13.1758 30.372 12.7576L30.7206 11.9106C30.8015 11.7139 30.9161 11.5402 31.0534 11.392C32.1798 13.3275 32.9479 15.2568 33.4116 16.9415C33.8257 18.4459 33.9813 19.6971 33.9656 20.5634C33.9574 21.0155 34.2348 21.4619 34.6744 21.5677C35.114 21.6736 35.5569 21.4012 35.5876 20.9501C35.6665 19.7901 35.4632 18.2236 34.9907 16.5068C34.5152 14.7792 33.7479 12.8276 32.6389 10.8634C32.6989 10.8745 32.7589 10.8888 32.8187 10.9065L33.9741 11.2487C34.4075 11.3769 34.8626 11.1297 34.9912 10.6964C35.1195 10.263 34.8725 9.80695 34.4391 9.67843L32.3389 9.05639Z" fill="white" fillOpacity="0.9"/>
    </svg>
  );

  // Lock/Unlock icon SVG
  const lockIcon = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.2241 36.6667H27.7694C30.2668 36.6667 31.592 35.3075 31.592 32.6231V20.9174C31.592 18.233 30.2668 16.8909 27.7694 16.8909H12.2241C9.72661 16.8909 8.40143 18.233 8.40143 20.9174V32.6231C8.40143 35.3075 9.72661 36.6667 12.2241 36.6667ZM11.3746 18.1991H14.0759V12.4567C14.0759 8.17532 16.8112 5.89873 19.9882 5.89873C23.1653 5.89873 25.9346 8.17532 25.9346 12.4567V18.1991H28.6189V12.8304C28.6189 6.4424 24.4395 3.33333 19.9882 3.33333C15.554 3.33333 11.3746 6.4424 11.3746 12.8304V18.1991Z" fill="white" fillOpacity="0.9"/>
    </svg>
  );

  // Use OrbitControls' props to set initial angles instead of modifying them imperatively
  return (
    <div className="vehicle-3d-container">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 60, // Increased FOV to see more of the model and prevent cropping
        }}
        gl={{ antialias: true, alpha: true }}
        shadows
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0);
          // Look at offset position to match model shift
          state.camera.lookAt(MODEL_X_OFFSET, 0, 0);
          // Add exponential fog for dramatic depth blur effect
          state.scene.fog = new THREE.FogExp2('rgb(0, 0, 0)', 0.04);
        }}
      >
        {/* Enhanced Lighting Setup - Much Brighter */}
        <ambientLight intensity={2.0} color="rgb(188, 217, 255)"/>
        
        {/* Main directional light (sun) - blue */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={3.0}
          color="#D2DCFF" // Blue color
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Fill light from opposite side - blue */}
        <directionalLight position={[-5, 3, -5]} intensity={5.0} color="rgb(87, 96, 131)" />
        
        {/* Rim light for edge definition with blue */}
        <pointLight position={[0, 5, -8]} intensity={3.0} color="#F3EAF9" />
        
        {/* Accent light from above with blue */}
        <pointLight position={[0, 10, 0]} intensity={2.5} color="#F3EAF9" />
        
        {/* Additional blue fill light */}
        <pointLight position={[-3, 4, 3]} intensity={2.0} color="#3a80d2" />
        
        {/* Blue accent light */}
        <pointLight position={[3, 4, 3]} intensity={1.8} color="#F3EAF9" />
        
        {/* Environment removed to prevent warm yellow/orange reflections - using only blue lights for cool tones */}

        {/* Background sphere for environment gradient */}
        <BackgroundSphere />

        {/* 3D Background - Ground Plane that pans with the car */}
        <GroundPlane />
        <GridHelper />

        {/* Vehicle Model */}
        <VehicleModel 
          onPositionUpdate={handleVehiclePositionUpdate}
          onRoofPositionUpdate={handleRoofPositionUpdate}
        />

        {/* Position Tracker for tailgate button */}
        <PositionTracker 
          positionRef={vehiclePositionRef}
          onScreenPositionUpdate={setButtonPosition}
        />

        {/* Position Tracker for lock button */}
        <PositionTracker 
          positionRef={roofPositionRef}
          onScreenPositionUpdate={setLockButtonPosition}
        />

        {/* OrbitControls with default angles */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
          target={[MODEL_X_OFFSET, 0, 0]}
          // These control the startup view:
          defaultPolarAngle={DEFAULT_POLAR}
          defaultAzimuthAngle={DEFAULT_AZIMUTH}
        />
      </Canvas>
      
      {/* Tailgate Button Overlay */}
      {buttonPosition.visible && (
        <div 
          className="tailgate-button-overlay"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Button
            variant="secondary"
            size="large"
            onClick={handleOpenTailgate}
            icon={tailgateIcon}
            aria-label="Open Tailgate"
          />
        </div>
      )}
      
      {/* Lock/Unlock Button Overlay */}
      {lockButtonPosition.visible && (
        <div 
          className="tailgate-button-overlay"
          style={{
            left: `${lockButtonPosition.x}px`,
            top: `${lockButtonPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Button
            variant="secondary"
            size="large"
            onClick={handleToggleLock}
            icon={lockIcon}
            aria-label={isLocked ? "Unlock Vehicle" : "Lock Vehicle"}
          />
        </div>
      )}
    </div>
  );
}

export default Vehicle3D;
