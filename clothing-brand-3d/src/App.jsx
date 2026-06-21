import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

// Rotating Clothing Hanger Component
function RotatingHanger() {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Hanger Hook */}
      <mesh position={[0, 2.5, 0]}>
        <torusGeometry args={[0.15, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#c9a961" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hanger Bar */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 32]} />
        <meshStandardMaterial color="#c9a961" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hanger Body */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.8, 32]} />
        <meshStandardMaterial color="#c9a961" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* T-Shirt */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 2, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* T-Shirt Sleeves */}
      <mesh position={[-1, 0.8, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      <mesh position={[1, 0.8, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Logo on Shirt */}
      <mesh position={[0, 0.8, 0.16]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#c9a961" roughness={0.3} />
      </mesh>
    </group>
  )
}

// Floating Particles Background
function Particles({ count = 100 }) {
  const mesh = useRef()
  const positions = new Float32Array(count * 3)
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20
  }
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#c9a961" transparent opacity={0.6} />
    </points>
  )
}

// Main Scene Component
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c9a961" />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Floating Hanger with Clothes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <RotatingHanger />
      </Float>
      
      {/* Background Particles */}
      <Particles count={150} />
      
      {/* Shadows */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={4} 
        color="#000000" 
      />
    </>
  )
}

// Main App Component
export default function App() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <a href="#" className="logo">AURA</a>
        <ul className="nav-links">
          <li><a href="#collection">Collection</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          REDEFINE<br />
          YOUR STYLE
        </h1>
        <p className="hero-subtitle">
          Premium quality clothing crafted for the modern individual. 
          Experience luxury in every thread.
        </p>
        <a href="#shop" className="cta-button">Explore Collection</a>
      </div>
      
      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <Scene />
        </Canvas>
      </div>
      
      {/* Product Info */}
      <div className="product-overlay">
        <h2 className="product-name">Signature Tee</h2>
        <p className="product-price">$89.00</p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <span>Scroll</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </>
  )
}
