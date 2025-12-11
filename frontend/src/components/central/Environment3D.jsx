import React, { Suspense, useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useHMI } from '../../contexts/HMIContext';
import './Environment3D.css';

// Camera Settings
const CAMERA_SETTINGS = {
  distance: 5,           // Distance from center
  azimuth: Math.PI / 6,  // Horizontal angle (radians) - slight angle from front
  polar: Math.PI / 1.5,  // Vertical angle (radians) - slightly above horizon
  fov: 60,               // Field of view
  
  // OrbitControls limits
  minDistance: 3,
  maxDistance: 12,
  minPolarAngle: Math.PI / 6,   // Minimum vertical angle (prevent looking from below)
  maxPolarAngle: Math.PI / 2.2, // Maximum vertical angle (prevent looking straight down)
  enablePan: false,
  enableZoom: false,
  enableRotate: false,
  autoRotate: false,
};

// Particle System Settings
const PARTICLE_SETTINGS = {
  density: {
    useQualityPreset: false,
    custom: 250,
  },
  speed: {
    overall: 0.5,
    horizontal: 0.5,
    vertical: 0.2,
  },
  direction: {
    x: 0.0,
    y: 0.5,
    z: 0.0,
  },
  appearance: {
    sizeMin: 0.02,
    sizeMax: 0.08,
    opacity: 0.4,
    color: 'rgb(109, 135, 194)',
  },
  spawnArea: {
    width: 15,
    height: 8,
    yOffset: -2,
  },
  behavior: {
    resetHeight: 2,
    resetHeightMin: -4,
    maxDrift: 10,
    respawnOffset: 2,
  },
};

// Ground Plane Settings
const GROUND_SETTINGS = {
  texture: {
    enabled: true,
    path: '/images/marble_2.png',
    repeat: { x: 6, y: 2 },
    rotation: 15,
    opacity: 1,
  },
  material: {
    color: 'rgb(107, 110, 125)',
    roughness: 0.7,
    metalness: 0.2,
  },
  reflection: {
    enabled: false, // Simplified for environment-only view
    intensity: 1.0,
    blur: [150, 150],
    mixBlur: 1.1,
    mixStrength: 7,
    mirror: 0.5,
    offset: 0,
  },
  geometry: {
    size: 60,
    bumpiness: 0.1,
    enableBumps: true,
  },
  position: {
    xOffset: 0,
    yOffset: -0.58,
  },
};

// Quality presets
const QUALITY_PRESETS = {
  low: {
    groundSubdivisions: 25,
    enableShadows: false,
    enableFog: false,
    backgroundSphereSubdivisions: 16,
    particleCount: 200,
  },
  medium: {
    groundSubdivisions: 50,
    enableShadows: true,
    enableFog: true,
    backgroundSphereSubdivisions: 24,
    particleCount: 400,
  },
  high: {
    groundSubdivisions: 100,
    enableShadows: true,
    enableFog: true,
    backgroundSphereSubdivisions: 32,
    particleCount: 800,
  },
};

// Ground Plane
function GroundPlane({ quality }) {
  const meshRef = useRef();
  const preset = QUALITY_PRESETS[quality];
  
  const bumpyGeometry = useMemo(() => {
    const subdivisions = preset.groundSubdivisions;
    const size = GROUND_SETTINGS.geometry.size;
    const geometry = new THREE.PlaneGeometry(size, size, subdivisions, subdivisions);
    
    if (GROUND_SETTINGS.geometry.enableBumps) {
      const positions = geometry.attributes.position.array;
      const bumpHeight = GROUND_SETTINGS.geometry.bumpiness;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        
        const bump1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * bumpHeight;
        const bump2 = Math.sin(x * 0.8) * Math.cos(z * 0.8) * bumpHeight * 0.8;
        const bump3 = Math.sin(x * 1.5) * Math.cos(z * 1.5) * bumpHeight * 0.25;
        
        positions[i + 2] = bump1 + bump2 + bump3;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }, [preset.groundSubdivisions]);
  
  const texture = useMemo(() => {
    if (!GROUND_SETTINGS.texture.enabled) return null;
    
    const loader = new THREE.TextureLoader();
    const tex = loader.load(GROUND_SETTINGS.texture.path);
    
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(
      GROUND_SETTINGS.texture.repeat.x, 
      GROUND_SETTINGS.texture.repeat.y
    );
    tex.rotation = GROUND_SETTINGS.texture.rotation;
    
    return tex;
  }, []);
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[
        GROUND_SETTINGS.position.xOffset, 
        GROUND_SETTINGS.position.yOffset, 
        0
      ]}
      receiveShadow={preset.enableShadows}
      geometry={bumpyGeometry}
    >
      <meshStandardMaterial 
        map={texture}
        color={GROUND_SETTINGS.material.color}
        roughness={GROUND_SETTINGS.material.roughness}
        metalness={GROUND_SETTINGS.material.metalness}
        transparent={GROUND_SETTINGS.texture.opacity < 1.0}
        opacity={GROUND_SETTINGS.texture.opacity}
      />
    </mesh>
  );
}

// Grid helper
function GridHelper() {
  return (
    <gridHelper 
      args={[50, 50, '#2a2a3e', '#1a1a2e']} 
      position={[0, -1.19, 0]}
    />
  );
}

// Background sphere
function BackgroundSphere({ quality }) {
  const preset = QUALITY_PRESETS[quality];
  
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(0.3, '#000');
    gradient.addColorStop(1, 'hsl(220, 55.70%, 72.50%)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  return (
    <mesh>
      <sphereGeometry args={[100, preset.backgroundSphereSubdivisions, preset.backgroundSphereSubdivisions]} />
      <meshBasicMaterial 
        map={gradientTexture}
        side={THREE.BackSide}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
}

// Dust Particles
function DustParticles({ quality }) {
  const particlesRef = useRef();
  const preset = QUALITY_PRESETS[quality];
  
  const particleCount = PARTICLE_SETTINGS.density.useQualityPreset 
    ? preset.particleCount 
    : PARTICLE_SETTINGS.density.custom;
  
  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const { spawnArea, appearance, speed, direction } = PARTICLE_SETTINGS;
    const spread = spawnArea.width;
    const height = spawnArea.height;
    const yOffset = spawnArea.yOffset;
    
    const baseHorizontalSpeed = 0.003;
    const baseVerticalSpeed = 0.005;
    const baseVerticalMin = 0.002;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = Math.random() * height + yOffset;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      velocities[i3] = (
        (Math.random() - 0.5 + direction.x) * baseHorizontalSpeed * 
        speed.horizontal * speed.overall
      );
      
      velocities[i3 + 1] = (
        (Math.random() * baseVerticalSpeed + baseVerticalMin + direction.y * 0.002) * 
        speed.vertical * speed.overall
      );
      
      velocities[i3 + 2] = (
        (Math.random() - 0.5 + direction.z) * baseHorizontalSpeed * 
        speed.horizontal * speed.overall
      );
      
      const sizeRange = appearance.sizeMax - appearance.sizeMin;
      sizes[i] = Math.random() * sizeRange + appearance.sizeMin;
    }
    
    return { positions, velocities, sizes };
  }, [particleCount]);
  
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    const { spawnArea, behavior, direction } = PARTICLE_SETTINGS;
    
    const isMovingDown = direction.y < 0;
    const minHeight = behavior.resetHeightMin;
    const maxHeight = spawnArea.yOffset + spawnArea.height;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      let needsReset = false;
      
      if (isMovingDown) {
        needsReset = positions[i3 + 1] < minHeight;
      } else {
        needsReset = positions[i3 + 1] > behavior.resetHeight;
      }
      
      if (Math.abs(positions[i3]) > behavior.maxDrift || 
          Math.abs(positions[i3 + 2]) > behavior.maxDrift) {
        needsReset = true;
      }
      
      if (needsReset) {
        positions[i3] = (Math.random() - 0.5) * spawnArea.width;
        positions[i3 + 2] = (Math.random() - 0.5) * spawnArea.width;
        
        if (isMovingDown) {
          positions[i3 + 1] = maxHeight + Math.random() * behavior.respawnOffset;
        } else {
          positions[i3 + 1] = spawnArea.yOffset;
        }
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PARTICLE_SETTINGS.appearance.sizeMax}
        map={particleTexture}
        transparent={true}
        opacity={PARTICLE_SETTINGS.appearance.opacity}
        color={PARTICLE_SETTINGS.appearance.color}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Lighting component
function SceneLighting({ quality }) {
  const preset = QUALITY_PRESETS[quality];
  
  return (
    <>
      <ambientLight intensity={1.5} color="rgb(188, 217, 255)"/>
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={5.0}
        color="#D2DCFF"
      />
      <directionalLight position={[-5, 3, -5]} intensity={10.0} color="rgb(87, 96, 131)" />
      <pointLight position={[0, 10, 0]} intensity={8} color="#F3EAF9" />
    </>
  );
}

const Environment3D = memo(function Environment3D() {
  const { state } = useHMI();
  const controlsRef = useRef();
  
  const quality = useMemo(() => state.graphicsQuality || 'medium', [state.graphicsQuality]);
  const preset = QUALITY_PRESETS[quality];

  // Calculate camera position from spherical coordinates
  const getCameraPosition = (radius, polar, azimuth) => {
    const x = radius * Math.sin(polar) * Math.cos(azimuth);
    const y = radius * Math.cos(polar);
    const z = radius * Math.sin(polar) * Math.sin(azimuth);
    return [x, y, z];
  };

  const cameraPosition = getCameraPosition(
    CAMERA_SETTINGS.distance,
    CAMERA_SETTINGS.polar,
    CAMERA_SETTINGS.azimuth
  );

  return (
    <div className="environment-3d-container">
      <Canvas
        key={`env-canvas-${quality}`}
        camera={{
          position: cameraPosition,
          fov: CAMERA_SETTINGS.fov,
        }}
        gl={{ 
          antialias: quality !== 'low', 
          alpha: true,
          preserveDrawingBuffer: false,
        }}
        shadows={preset.enableShadows}
        dpr={[1, 2]}
        frameloop="always"
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0);
          state.camera.lookAt(0, 0, 0);
          if (preset.enableFog) {
            state.scene.fog = new THREE.FogExp2('rgb(0, 0, 0)', 0.05);
          }
        }}
      >
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Lighting */}
        <SceneLighting quality={quality} />

        {/* Background sphere */}
        <BackgroundSphere quality={quality} />

        {/* Dust Particles */}
        <DustParticles quality={quality} />

        {/* Ground and Grid */}
        <GroundPlane quality={quality} />
        <GridHelper />

        {/* OrbitControls for camera interaction */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={CAMERA_SETTINGS.enablePan}
          enableZoom={CAMERA_SETTINGS.enableZoom}
          enableRotate={CAMERA_SETTINGS.enableRotate}
          minDistance={CAMERA_SETTINGS.minDistance}
          maxDistance={CAMERA_SETTINGS.maxDistance}
          minPolarAngle={CAMERA_SETTINGS.minPolarAngle}
          maxPolarAngle={CAMERA_SETTINGS.maxPolarAngle}
          autoRotate={CAMERA_SETTINGS.autoRotate}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
});

export default Environment3D;
