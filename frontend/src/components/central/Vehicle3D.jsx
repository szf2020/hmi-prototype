import React, { Suspense, useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Button from '../../design-system/components/Button/Button';
import { useHMI } from '../../contexts/HMIContext';
import './Vehicle3D.css';

// Particle System Settings - Adjust these to customize dust effect
const PARTICLE_SETTINGS = {
  // Particle Density (overrides quality presets if specified)
  density: {
    useQualityPreset: false, // Set to false to use custom density
    custom: 250, // Custom particle count (used when useQualityPreset is false)
  },
  
  // Particle Speed (multipliers for velocity)
  speed: {
    overall: 0.5,        // Global speed multiplier (1.0 = default, 2.0 = twice as fast)
    horizontal: 0.5,     // X/Z axis drift speed multiplier
    vertical: 0.2,       // Y axis rise speed multiplier
  },
  
  // Particle Direction Bias
  direction: {
    x: 0.0,   // Horizontal bias (-1.0 = left, 0 = random, 1.0 = right)
    y: 0.5,   // Vertical bias (-1.0 = down, 0 = random, 1.0 = up)
    z: 0.0,   // Depth bias (-1.0 = backward, 0 = random, 1.0 = forward)
  },
  
  // Particle Appearance
  appearance: {
    sizeMin: 0.02,       // Minimum particle size
    sizeMax: 0.08,       // Maximum particle size
    opacity: 0.4,        // Overall opacity (0.0 - 1.0)
    color: 'rgb(109, 135, 194)',    // Particle color (hex or rgb)
  },
  
  // Spawn Area (relative to vehicle center)
  spawnArea: {
    width: 15,           // Horizontal spread (X/Z)
    height: 8,           // Vertical spread (Y)
    yOffset: -2,         // Starting Y position offset
  },
  
  // Behavior
  behavior: {
    resetHeight: 2,      // Height at which particles reset (for upward motion)
    resetHeightMin: -4,  // Minimum height before reset (for downward motion)
    maxDrift: 10,        // Max horizontal distance before reset
    respawnOffset: 2,    // Extra height above/below spawn area for smoother respawn
  },
};

// Ground Plane Settings - Adjust these to customize the floor/ground appearance
const GROUND_SETTINGS = {
  // Texture Configuration
  texture: {
    enabled: true,                      // Enable/disable texture (false = solid color)
    path: '/images/marble_2.png',     // Path to texture image
    repeat: { x: 6, y: 1 },            // Texture tiling (higher = more repetitions)
    rotation: 15,                        // Texture rotation in radians (0 = no rotation)
    opacity: 1,                       // Texture opacity (0.0 = invisible, 1.0 = fully visible)
  },
  
  // Material Properties
  material: {
    color: 'rgb(107, 110, 125)',      // Base color (white = shows texture as-is)
    roughness: 0.7,        // Surface roughness (0 = smooth/shiny, 1 = rough/matte) - controls reflection clarity
    metalness: 0.2,        // Metallic property (0 = non-metal, 1 = full metal)
  },
  
  // Reflection Properties
  reflection: {
    enabled: true,         // Enable/disable ground reflections
    intensity: 1.0,        // Reflection intensity (0 = no reflection, 1 = full reflection)
    blur: [200, 200],     // Reflection blur [horizontal, vertical] (0 = sharp, higher = more blur)
    mixBlur: 1.25,           // How much blur mixes with distance
    mixStrength: 5,     // Strength of the reflection mix (0 = no reflection, higher = stronger reflection)
    mirror: 0.2,          // Mirror-like quality (0 = realistic, 1 = perfect mirror)
    offset: 0,          // Reflection vertical offset (0 = at ground level, higher = further below ground)
  },
  
  // Geometry & Shape
  geometry: {
    size: 60,              // Ground plane size (width/height in units)
    bumpiness: 0.1,        // Height variation for bumpy surface (0 = flat)
    enableBumps: true,     // Toggle bumpy displacement on/off
    
    // Texture-based displacement settings
    textureDisplacement: {
      enabled: false,            // Enable texture-based height displacement
      path: '/images/marble_displace.png',  // Path to displacement/heightmap image (can be different from texture)
      strength: 1,           // Displacement intensity (how much texture affects height)
      repeat: { x: 1, y: 1.3 },  // Displacement texture tiling (independent from visual texture)
      offset: { x: 0, y: 0 },  // Displacement texture offset (0-1 range, shifts the pattern)
    },
  },
  
  // Position
  position: {
    xOffset: 3,            // Horizontal position (left/right from center)
    yOffset: -0.58,        // Vertical position (height from origin)
  },
};

// Quality presets
const QUALITY_PRESETS = {
  low: {
    groundSubdivisions: 25,
    shadowMapSize: 512,
    enableShadows: false,
    lightCount: 'minimal',
    materialQuality: 'standard',
    enableFog: false,
    backgroundSphereSubdivisions: 16,
    particleCount: 200,
  },
  medium: {
    groundSubdivisions: 50,
    shadowMapSize: 1024,
    enableShadows: true,
    lightCount: 'balanced',
    materialQuality: 'standard',
    enableFog: true,
    backgroundSphereSubdivisions: 24,
    particleCount: 400,
  },
  high: {
    groundSubdivisions: 100,
    shadowMapSize: 2048,
    enableShadows: true,
    lightCount: 'full',
    materialQuality: 'physical',
    enableFog: true,
    backgroundSphereSubdivisions: 32,
    particleCount: 800,
  },
};

// Model-specific scale and position configurations
// Adjust the targetSize and position offsets for each model to get the perfect fit
const MODEL_SCALE_CONFIG = {
  '/models/vehicle.glb': {
    targetSize: 3.8, // Original default vehicle - smaller size
    positionOffset: { x: 0, y: 0.01, z: 0 }, // No offset
    rotation: { x: 0, y: 0, z: 0 }, // No rotation
  },
  '/models/dodge.glb': {
    targetSize: 4.3, // Dodge model - larger to be visible
    positionOffset: { x: 0, y: -0.7, z: 0 }, // Adjust these values to reposition
    rotation: { x: 0, y: 0, z: 0 }, // Default rotation, update as needed
  },
  '/models/tpz-fuchs.glb': {
    targetSize: 4.1, // Military vehicle - armored transport
    positionOffset: { x: 0, y: 1.9, z: 0 },
    rotation: { x: 0, y: -90, z: 0 }, // Example: rotated 180 degrees on Y
  },
  '/models/suv.glb': {
    targetSize: 5.0, // Placeholder for future SUV
    positionOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  '/models/sports-car.glb': {
    targetSize: 4.5, // Placeholder for future sports car
    positionOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  '/models/truck.glb': {
    targetSize: 5.5, // Placeholder for future truck
    positionOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
};

// Fallback scale and position if model not in config
const DEFAULT_TARGET_SIZE = 5.0;
const DEFAULT_POSITION_OFFSET = { x: 0, y: 0, z: 0 };
const DEFAULT_ROTATION = { x: 0, y: 0, z: 0 };

const DEFAULT_DISTANCE = 3.8;
const DEFAULT_AZIMUTH = Math.PI / 4.5;
const DEFAULT_POLAR = Math.PI / 2;
const MODEL_X_OFFSET = 0.4;

// 3D Background - Ground Plane that pans with the car
function GroundPlane({ quality }) {
  const meshRef = useRef();
  const preset = QUALITY_PRESETS[quality];
  
  // State to track when displacement texture is loaded
  const [displacementLoaded, setDisplacementLoaded] = useState(false);
  const [displacementTexture, setDisplacementTexture] = useState(null);
  
  // Load texture for displacement mapping
  useEffect(() => {
    if (!GROUND_SETTINGS.geometry.textureDisplacement.enabled) {
      setDisplacementTexture(null);
      return;
    }
    
    setDisplacementLoaded(false);
    const loader = new THREE.TextureLoader();
    const tex = loader.load(
      GROUND_SETTINGS.geometry.textureDisplacement.path,
      () => {
        // onLoad callback
        setDisplacementLoaded(true);
      },
      undefined,
      (error) => {
        console.error('Error loading displacement texture:', error);
      }
    );
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    setDisplacementTexture(tex);
  }, []);
  
  // Create bumpy geometry using useMemo
  const bumpyGeometry = useMemo(() => {
    const subdivisions = preset.groundSubdivisions;
    const size = GROUND_SETTINGS.geometry.size;
    const geometry = new THREE.PlaneGeometry(size, size, subdivisions, subdivisions);
    
    if (GROUND_SETTINGS.geometry.enableBumps) {
      const positions = geometry.attributes.position.array;
      const bumpHeight = GROUND_SETTINGS.geometry.bumpiness;
      
      // Add bumpiness using noise-like displacement
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        
        // Create bumpy surface using multiple sine waves
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
  
  // Apply texture-based displacement after texture loads
  useEffect(() => {
    if (!displacementTexture || !GROUND_SETTINGS.geometry.textureDisplacement.enabled) return;
    if (!meshRef.current) return;
    if (!displacementLoaded) return;
    
    const img = displacementTexture.image;
    if (!img || !img.complete) return;
    
    applyTextureDisplacement();
    
    function applyTextureDisplacement() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      const geometry = meshRef.current.geometry;
      const positions = geometry.attributes.position.array;
      const strength = GROUND_SETTINGS.geometry.textureDisplacement.strength;
      const repeatX = GROUND_SETTINGS.geometry.textureDisplacement.repeat.x;
      const repeatY = GROUND_SETTINGS.geometry.textureDisplacement.repeat.y;
      const offsetX = GROUND_SETTINGS.geometry.textureDisplacement.offset.x;
      const offsetY = GROUND_SETTINGS.geometry.textureDisplacement.offset.y;
      
      console.log('Applying displacement - strength:', strength, 'repeat:', [repeatX, repeatY], 'offset:', [offsetX, offsetY]);
      
      // Apply texture height to each vertex
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        
        // Convert world position to UV coordinates (0-1 range)
        const size = GROUND_SETTINGS.geometry.size;
        let u = ((x + size / 2) / size) * repeatX + offsetX;
        let v = ((z + size / 2) / size) * repeatY + offsetY;
        
        // Wrap UV to 0-1 range
        u = u - Math.floor(u);
        v = v - Math.floor(v);
        
        // Sample texture at this position
        const px = Math.floor(u * (canvas.width - 1));
        const py = Math.floor(v * (canvas.height - 1));
        const index = (py * canvas.width + px) * 4;
        
        // Get grayscale value (average of RGB)
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const brightness = (r + g + b) / 3 / 255; // Normalize to 0-1
        
        // Add texture-based displacement on top of existing bumps
        const displacement = (brightness - 0.5) * strength;
        positions[i + 2] += displacement;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      console.log('Displacement applied successfully');
    }
  }, [displacementTexture, displacementLoaded, preset.groundSubdivisions]);
  
  // Load and configure texture for appearance
  const texture = useMemo(() => {
    if (!GROUND_SETTINGS.texture.enabled) return null;
    
    const loader = new THREE.TextureLoader();
    const tex = loader.load(GROUND_SETTINGS.texture.path);
    
    // Configure texture wrapping and repeat
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
        MODEL_X_OFFSET + GROUND_SETTINGS.position.xOffset, 
        GROUND_SETTINGS.position.yOffset, 
        0
      ]}
      receiveShadow={preset.enableShadows}
      geometry={bumpyGeometry}
    >
      {GROUND_SETTINGS.reflection.enabled ? (
        <MeshReflectorMaterial
          map={texture}
          color={GROUND_SETTINGS.material.color}
          roughness={GROUND_SETTINGS.material.roughness}
          metalness={GROUND_SETTINGS.material.metalness}
          blur={GROUND_SETTINGS.reflection.blur}
          mixBlur={GROUND_SETTINGS.reflection.mixBlur}
          mixStrength={GROUND_SETTINGS.reflection.mixStrength}
          mirror={GROUND_SETTINGS.reflection.mirror}
          resolution={1024}
          depthScale={0}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          depthToBlurRatioBias={0.25}
          reflectorOffset={GROUND_SETTINGS.reflection.offset}
        />
      ) : (
        <meshStandardMaterial 
          map={texture}
          color={GROUND_SETTINGS.material.color}
          roughness={GROUND_SETTINGS.material.roughness}
          metalness={GROUND_SETTINGS.material.metalness}
          transparent={GROUND_SETTINGS.texture.opacity < 1.0}
          opacity={GROUND_SETTINGS.texture.opacity}
        />
      )}
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

// Dust Particles for atmospheric effect
function DustParticles({ quality }) {
  const particlesRef = useRef();
  const preset = QUALITY_PRESETS[quality];
  
  // Determine particle count based on settings
  const particleCount = PARTICLE_SETTINGS.density.useQualityPreset 
    ? preset.particleCount 
    : PARTICLE_SETTINGS.density.custom;
  
  // Create particle geometry and initial positions
  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Get settings
    const { spawnArea, appearance, speed, direction } = PARTICLE_SETTINGS;
    const spread = spawnArea.width;
    const height = spawnArea.height;
    const yOffset = spawnArea.yOffset;
    
    // Base velocity values
    const baseHorizontalSpeed = 0.003;
    const baseVerticalSpeed = 0.005;
    const baseVerticalMin = 0.002;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random position in a box around the vehicle
      positions[i3] = (Math.random() - 0.5) * spread + MODEL_X_OFFSET;
      positions[i3 + 1] = Math.random() * height + yOffset;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      // Calculate velocities with direction bias and speed multipliers
      // X velocity (horizontal left/right)
      velocities[i3] = (
        (Math.random() - 0.5 + direction.x) * baseHorizontalSpeed * 
        speed.horizontal * speed.overall
      );
      
      // Y velocity (vertical up/down) - typically upward for dust
      velocities[i3 + 1] = (
        (Math.random() * baseVerticalSpeed + baseVerticalMin + direction.y * 0.002) * 
        speed.vertical * speed.overall
      );
      
      // Z velocity (horizontal forward/back)
      velocities[i3 + 2] = (
        (Math.random() - 0.5 + direction.z) * baseHorizontalSpeed * 
        speed.horizontal * speed.overall
      );
      
      // Varying sizes for depth perception
      const sizeRange = appearance.sizeMax - appearance.sizeMin;
      sizes[i] = Math.random() * sizeRange + appearance.sizeMin;
    }
    
    return { positions, velocities, sizes };
  }, [particleCount]);
  
  // Create particle texture (circular sprite)
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw a soft circular gradient
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    const { spawnArea, behavior, direction } = PARTICLE_SETTINGS;
    
    // Determine if particles are moving up or down based on direction bias
    const isMovingDown = direction.y < 0;
    const minHeight = behavior.resetHeightMin;
    const maxHeight = spawnArea.yOffset + spawnArea.height;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Apply velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Check if particle needs to reset based on direction
      let needsReset = false;
      
      if (isMovingDown) {
        // For falling particles, reset when they go below minimum height
        needsReset = positions[i3 + 1] < minHeight;
      } else {
        // For rising particles, reset when they go above reset height
        needsReset = positions[i3 + 1] > behavior.resetHeight;
      }
      
      // Also reset if drifted too far horizontally
      if (Math.abs(positions[i3] - MODEL_X_OFFSET) > behavior.maxDrift || 
          Math.abs(positions[i3 + 2]) > behavior.maxDrift) {
        needsReset = true;
      }
      
      if (needsReset) {
        // Respawn particle
        positions[i3] = (Math.random() - 0.5) * spawnArea.width + MODEL_X_OFFSET;
        positions[i3 + 2] = (Math.random() - 0.5) * spawnArea.width;
        
        // Reset height depends on direction
        if (isMovingDown) {
          // Spawn at top for falling particles
          positions[i3 + 1] = maxHeight + Math.random() * behavior.respawnOffset;
        } else {
          // Spawn at bottom for rising particles
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

// Component with 3D model loader
function VehicleModelWithFile({ modelPath = '/models/vehicle.glb', onPositionUpdate, onRoofPositionUpdate, quality }) {
  const meshRef = useRef();
  const centeredRef = useRef(false);
  const boundingBoxRef = useRef(null);
  const preset = QUALITY_PRESETS[quality];
  
  const { scene } = useGLTF(modelPath);

  // Reset centering flag when model path changes
  useEffect(() => {
    centeredRef.current = false;
  }, [modelPath]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        // Use physical or standard material based on quality
        let material;
        if (preset.materialQuality === 'physical') {
          material = new THREE.MeshPhysicalMaterial({
            color: '#444',
            metalness: 1,
            roughness: 0.4,
            envMapIntensity: 0.7,
            sheen: 0.5,
            sheenColor: 'rgb(255, 255, 255)',
            sheenRoughness: 0.2,
            iridescence: 0,
          });
        } else {
          material = new THREE.MeshStandardMaterial({
            color: '#444',
            metalness: 0.9,
            roughness: 0.4,
          });
        }
        
        child.material = Array.isArray(child.material)
          ? child.material.map(() => material.clone())
          : material;
        
        child.castShadow = preset.enableShadows;
        child.receiveShadow = preset.enableShadows;
      }
    });
    
    return cloned;
  }, [scene, preset.materialQuality, preset.enableShadows]);

  useFrame(() => {
    if (meshRef.current && !centeredRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Get model-specific configuration or use defaults
      const modelConfig = MODEL_SCALE_CONFIG[modelPath];
      const targetSize = modelConfig ? modelConfig.targetSize : DEFAULT_TARGET_SIZE;
      const positionOffset = modelConfig ? modelConfig.positionOffset : DEFAULT_POSITION_OFFSET;
      const rotation = modelConfig ? modelConfig.rotation : DEFAULT_ROTATION;
      
      // Center the model and apply custom position offset
      meshRef.current.position.x = -center.x + MODEL_X_OFFSET + positionOffset.x;
      meshRef.current.position.y = -center.y + positionOffset.y;
      meshRef.current.position.z = -center.z + positionOffset.z;
      
      // Apply rotation (convert degrees to radians)
      meshRef.current.rotation.x = (rotation.x * Math.PI) / 180;
      meshRef.current.rotation.y = (rotation.y * Math.PI) / 180;
      meshRef.current.rotation.z = (rotation.z * Math.PI) / 180;
      
      // Normalize model size based on configured target
      const maxSize = Math.max(size.x, size.y, size.z);
      const scale = targetSize / maxSize;
      meshRef.current.scale.set(scale, scale, scale);
      
      boundingBoxRef.current = box;
      centeredRef.current = true;
    }
    
    if (meshRef.current && centeredRef.current && onPositionUpdate) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const backPosition = new THREE.Vector3();
      const size = box.getSize(new THREE.Vector3());
      backPosition.x = (box.min.x + box.max.x) / 2;
      backPosition.y = (box.min.y + box.max.y) / 2 + 0.4;
      backPosition.z = box.min.z;
      
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(meshRef.current.quaternion);
      backPosition.addScaledVector(direction, size.z * 0.1);
      backPosition.y += size.y * 0.15;
      
      onPositionUpdate(backPosition);
    }
    
    if (meshRef.current && centeredRef.current && onRoofPositionUpdate) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const roofPosition = new THREE.Vector3();
      roofPosition.x = (box.min.x + box.max.x) / 2;
      roofPosition.y = box.max.y;
      roofPosition.z = (box.min.z + box.max.z) / 2;
      
      const size = box.getSize(new THREE.Vector3());
      roofPosition.y += size.y * 0.2;
      
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
function VehicleModelFallback({ onPositionUpdate, onRoofPositionUpdate, quality }) {
  const meshRef = useRef();
  const centeredRef = useRef(false);
  const boundingBoxRef = useRef(null);
  const preset = QUALITY_PRESETS[quality];

  // Reset centering flag on mount (fallback is simpler, doesn't need modelPath dependency)
  useEffect(() => {
    centeredRef.current = false;
  }, []);

  useFrame(() => {
    if (meshRef.current && !centeredRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      
      meshRef.current.position.x = -center.x + MODEL_X_OFFSET;
      meshRef.current.position.y = -center.y;
      meshRef.current.position.z = -center.z;
      
      boundingBoxRef.current = box;
      centeredRef.current = true;
    }
    
    if (meshRef.current && centeredRef.current && onPositionUpdate) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const backPosition = new THREE.Vector3();
      backPosition.x = (box.min.x + box.max.x) / 2;
      backPosition.y = (box.min.y + box.max.y) / 2;
      backPosition.z = box.min.z;
      
      const size = box.getSize(new THREE.Vector3());
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(meshRef.current.quaternion);
      backPosition.addScaledVector(direction, size.z * 0.2);
      backPosition.y += size.y * 0.1;
      
      onPositionUpdate(backPosition);
    }
    
    if (meshRef.current && centeredRef.current && onRoofPositionUpdate) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const roofPosition = new THREE.Vector3();
      roofPosition.x = (box.min.x + box.max.x) / 2;
      roofPosition.y = box.max.y;
      roofPosition.z = (box.min.z + box.max.z) / 2;
      
      const size = box.getSize(new THREE.Vector3());
      roofPosition.y += size.y * 0.15;
      
      onRoofPositionUpdate(roofPosition);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]} castShadow={preset.enableShadows} receiveShadow={preset.enableShadows}>
        <boxGeometry args={[4, 1.2, 2]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow={preset.enableShadows} receiveShadow={preset.enableShadows}>
        <boxGeometry args={[2.5, 0.8, 1.8]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      {[
        [-1.2, -0.6, 1.1],
        [1.2, -0.6, 1.1],
        [-1.2, -0.6, -1.1],
        [1.2, -0.6, -1.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow={preset.enableShadows}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// Error Boundary component
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
function VehicleModel({ modelPath = '/models/vehicle.glb', onPositionUpdate, onRoofPositionUpdate, quality }) {
  const [useModel, setUseModel] = useState(true);

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
    return <VehicleModelFallback onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} quality={quality} />;
  }

  return (
    <ErrorBoundary fallback={<VehicleModelFallback onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} quality={quality} />}>
      <Suspense fallback={null}>
        <VehicleModelWithFile modelPath={modelPath} onPositionUpdate={onPositionUpdate} onRoofPositionUpdate={onRoofPositionUpdate} quality={quality} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Lighting component that adjusts based on quality
function SceneLighting({ quality }) {
  const preset = QUALITY_PRESETS[quality];
  
  if (preset.lightCount === 'minimal') {
    return (
      <>
        <ambientLight intensity={2.5} color="rgb(188, 217, 255)"/>
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={10.0}
          color="#D2DCFF"
        />
      </>
    );
  }
  
  if (preset.lightCount === 'balanced') {
    return (
      <>
        <ambientLight intensity={2.0} color="rgb(188, 217, 255)"/>
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={10}
          color="#D2DCFF"
          castShadow={preset.enableShadows}
          shadow-mapSize-width={preset.shadowMapSize}
          shadow-mapSize-height={preset.shadowMapSize}
        />
        <directionalLight position={[-5, 3, -5]} intensity={15.0} color="rgb(87, 96, 131)" />
        <pointLight position={[0, 10, 0]} intensity={10} color="#F3EAF9" />
      </>
    );
  }
  
  // Full lighting (high quality)
  return (
    <>
      <ambientLight intensity={1.0} color="rgb(188, 217, 255)"/>
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={3.0}
        color="#D2DCFF"
        castShadow={preset.enableShadows}
        shadow-mapSize-width={preset.shadowMapSize}
        shadow-mapSize-height={preset.shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 3, -5]} intensity={17.0} color="rgb(87, 96, 131)" />
      <pointLight position={[0, 5, -8]} intensity={10} color="#F3EAF9" />
      <pointLight position={[0, 10, 0]} intensity={12} color="#F3EAF9" />
      <pointLight position={[-3, 4, 3]} intensity={12.0} color="#3a80d2" />
      <pointLight position={[3, 4, 3]} intensity={11.8} color="#F3EAF9" />
    </>
  );
}

// Component to track 3D position and convert to screen coordinates
function PositionTracker({ positionRef, onScreenPositionUpdate }) {
  const { camera, gl } = useThree();
  
  useFrame(() => {
    if (positionRef.current) {
      const vector = positionRef.current.clone();
      vector.project(camera);
      
      // Get the canvas's actual bounding rectangle on the page
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      // Calculate position relative to the canvas's actual position
      const x = (vector.x * 0.5 + 0.5) * rect.width;
      const y = (vector.y * -0.5 + 0.5) * rect.height;
      
      if (vector.z < 1) {
        onScreenPositionUpdate({ x, y, visible: true });
      } else {
        onScreenPositionUpdate({ x, y, visible: false });
      }
    }
  });
  
  return null;
}

const Vehicle3D = memo(function Vehicle3D() {
  const { state } = useHMI();
  const controlsRef = useRef();
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, visible: false });
  const [lockButtonPosition, setLockButtonPosition] = useState({ x: 0, y: 0, visible: false });
  const vehiclePositionRef = useRef(new THREE.Vector3());
  const roofPositionRef = useRef(new THREE.Vector3());
  const [isLocked, setIsLocked] = useState(true);

  // Get quality from HMI context, default to medium if not set
  // Use useMemo to prevent re-calculating unless graphicsQuality changes
  const quality = useMemo(() => state.graphicsQuality || 'medium', [state.graphicsQuality]);

  const getCameraPosition = (radius, polar, azimuth) => {
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
    console.log('Opening tailgate...');
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
    console.log(isLocked ? 'Unlocking vehicle...' : 'Locking vehicle...');
  };

  const tailgateIcon = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.833 25.8332C18.5944 25.8332 20.8329 28.0718 20.833 30.8332C20.833 33.5946 18.5944 35.8332 15.833 35.8332C13.0717 35.833 10.833 33.5945 10.833 30.8332C10.8331 28.072 13.0718 25.8334 15.833 25.8332ZM23.6699 4.20432L28.8701 4.78146C29.5043 4.85193 29.6868 5.6875 29.1396 6.01584L26.7656 7.44064C26.7002 7.47989 26.6285 7.50768 26.5537 7.52267L22.6982 8.29416C22.5693 8.31995 22.4505 8.38285 22.3574 8.4758L16.6572 14.175C19.5023 15.282 23.2872 17.0712 25.4668 18.1506C25.693 18.2627 25.8308 18.4933 25.8457 18.7453C25.9207 20.0162 26.3262 21.2216 26.7168 22.383C27.1162 23.5705 27.5 24.7126 27.5 25.8332C27.5 26.9443 27.1663 29.3335 25.833 30.0002C25.1855 30.3239 24.2495 30.5294 23.3311 30.6555C23.2366 26.5955 19.9157 23.3332 15.833 23.3332C11.6911 23.3334 8.33307 26.6912 8.33301 30.8332C8.33301 31.1137 8.3489 31.3908 8.37891 31.6633L8.33301 31.6662H5C4.0796 31.6662 3.33313 30.9206 3.33301 30.0002V14.1662C3.33324 13.246 4.07967 12.5002 5 12.5002H6.66699C8.61143 12.5002 11.5005 12.6666 14.167 13.3332C14.3522 13.3795 14.5543 13.4381 14.7715 13.5051L23.1045 4.41623C23.2482 4.25943 23.4585 4.18083 23.6699 4.20432Z" fill="white" fillOpacity="0.9"/>
      <path d="M32.3389 9.05639C31.2172 8.72443 30.0261 9.29461 29.581 10.3764L28.8576 12.1349C28.6856 12.5531 28.8856 13.0321 29.3038 13.2041C29.722 13.376 30.2001 13.1758 30.372 12.7576L30.7206 11.9106C30.8015 11.7139 30.9161 11.5402 31.0534 11.392C32.1798 13.3275 32.9479 15.2568 33.4116 16.9415C33.8257 18.4459 33.9813 19.6971 33.9656 20.5634C33.9574 21.0155 34.2348 21.4619 34.6744 21.5677C35.114 21.6736 35.5569 21.4012 35.5876 20.9501C35.6665 19.7901 35.4632 18.2236 34.9907 16.5068C34.5152 14.7792 33.7479 12.8276 32.6389 10.8634C32.6989 10.8745 32.7589 10.8888 32.8187 10.9065L33.9741 11.2487C34.4075 11.3769 34.8626 11.1297 34.9912 10.6964C35.1195 10.263 34.8725 9.80695 34.4391 9.67843L32.3389 9.05639Z" fill="white" fillOpacity="0.9"/>
    </svg>
  );

  const lockIcon = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.2241 36.6667H27.7694C30.2668 36.6667 31.592 35.3075 31.592 32.6231V20.9174C31.592 18.233 30.2668 16.8909 27.7694 16.8909H12.2241C9.72661 16.8909 8.40143 18.233 8.40143 20.9174V32.6231C8.40143 35.3075 9.72661 36.6667 12.2241 36.6667ZM11.3746 18.1991H14.0759V12.4567C14.0759 8.17532 16.8112 5.89873 19.9882 5.89873C23.1653 5.89873 25.9346 8.17532 25.9346 12.4567V18.1991H28.6189V12.8304C28.6189 6.4424 24.4395 3.33333 19.9882 3.33333C15.554 3.33333 11.3746 6.4424 11.3746 12.8304V18.1991Z" fill="white" fillOpacity="0.9"/>
    </svg>
  );

  const preset = QUALITY_PRESETS[quality];

  return (
    <div className="vehicle-3d-container">
      <Canvas
        key={`canvas-${quality}`}
        camera={{
          position: cameraPosition,
          fov: 60,
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
          state.camera.lookAt(MODEL_X_OFFSET, 0, 0);
          if (preset.enableFog) {
            state.scene.fog = new THREE.FogExp2('rgb(0, 0, 0)', 0.05);
          }
        }}
      >
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Lighting based on quality */}
        <SceneLighting quality={quality} />

        {/* Background sphere */}
        <BackgroundSphere quality={quality} />

        {/* Dust Particles */}
        <DustParticles quality={quality} />

        {/* Ground and Grid */}
        <GroundPlane quality={quality} />
        <GridHelper />

        {/* Vehicle Model */}
        <VehicleModel 
          modelPath={state.selected3DModel || '/models/vehicle.glb'}
          onPositionUpdate={handleVehiclePositionUpdate}
          onRoofPositionUpdate={handleRoofPositionUpdate}
          quality={quality}
        />

        {/* Position Trackers */}
        <PositionTracker 
          positionRef={vehiclePositionRef}
          onScreenPositionUpdate={setButtonPosition}
        />
        <PositionTracker 
          positionRef={roofPositionRef}
          onScreenPositionUpdate={setLockButtonPosition}
        />

        {/* OrbitControls */}
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
});

export default Vehicle3D;
