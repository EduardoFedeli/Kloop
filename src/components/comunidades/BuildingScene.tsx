"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Float } from "@react-three/drei"
import * as THREE from "three"

interface BuildingSceneProps {
  onZoneChange: (zoneIndex: number) => void
}

export function BuildingScene({ onZoneChange }: BuildingSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Drag state
  const isDragging = useRef(false)
  const previousX = useRef(0)
  const rotationVelocity = useRef(0)
  const idleTime = useRef(3) // Start auto-rotating immediately
  
  const { gl, size } = useThree()
  const activeZone = useRef(0)

  // Load the optimized real model
  const { scene } = useGLTF("/models/community-building.glb")
  const clonedScene = useRef<THREE.Group | null>(null)

  useEffect(() => {
    // Clone to avoid mutating cached object
    const newScene = scene.clone()
    
    // Fix scale and center properly
    // 1. Scale down to fit the scene (target size = 4.5)
    const box = new THREE.Box3().setFromObject(newScene)
    const sizeVec = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z)
    
    if (maxDim > 0) {
      newScene.scale.setScalar(4.5 / maxDim)
    }

    // 2. Center the scaled object and align bottom to the platform
    const scaledBox = new THREE.Box3().setFromObject(newScene)
    const center = scaledBox.getCenter(new THREE.Vector3())
    const bottomY = scaledBox.min.y
    
    newScene.position.x -= center.x
    newScene.position.z -= center.z
    newScene.position.y -= bottomY // Bottom is now at Y=0
    newScene.position.y -= 2.4 // Push it down slightly above the ring (which is at -2.5)

    clonedScene.current = newScene
  }, [scene])
  
  // Handlers for drag
  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true
      previousX.current = e.clientX
      rotationVelocity.current = 0
      idleTime.current = 0
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const deltaX = e.clientX - previousX.current
      previousX.current = e.clientX
      
      // Calculate rotation based on screen width so it feels consistent
      const rotationAmount = (deltaX / size.width) * Math.PI * 2
      rotationVelocity.current = rotationAmount
      
      if (groupRef.current) {
        groupRef.current.rotation.y += rotationAmount
      }
      idleTime.current = 0
    }

    const onPointerUp = () => {
      isDragging.current = false
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
    }
  }, [gl, size])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Apply inertia / auto-rotation
    if (!isDragging.current) {
      idleTime.current += delta
      
      if (idleTime.current > 2) {
        // Resume auto-rotation smoothly
        const targetVelocity = delta * 0.15
        rotationVelocity.current = THREE.MathUtils.lerp(rotationVelocity.current, targetVelocity, 0.05)
      } else {
        // Friction when just released
        rotationVelocity.current *= 0.95 
      }
      
      groupRef.current.rotation.y += rotationVelocity.current
    }

    // Calculate current zone
    // Normalize rotation to 0 - 2PI
    let normalizedRot = groupRef.current.rotation.y % (Math.PI * 2)
    if (normalizedRot < 0) normalizedRot += Math.PI * 2
    
    // Reverse it because rotating right (positive Y) means we are looking at the "left" side
    const reversedRot = (Math.PI * 2) - normalizedRot

    // 0 to PI/2 -> Zone 0
    // PI/2 to PI -> Zone 1
    // PI to 1.5PI -> Zone 2
    // 1.5PI to 2PI -> Zone 3
    const newZone = Math.floor(reversedRot / (Math.PI / 2)) % 4
    
    if (newZone !== activeZone.current) {
      activeZone.current = newZone
      onZoneChange(newZone)
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {clonedScene.current ? (
          <primitive object={clonedScene.current} />
        ) : (
          <BuildingPlaceholder /> // Fallback while loading or if model is missing
        )}
        
        {/* Glow Ring Platform (kept from the previous version) */}
        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.0, 3.5, 64]} />
          <meshBasicMaterial color="#40916C" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </Float>
      
      {/* Relighting: Cool tech lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.8} color="#D8F3DC" />
      <directionalLight position={[-10, -5, -10]} intensity={0.6} color="#40916C" />
      <spotLight position={[0, -10, 5]} angle={0.5} penumbra={1} intensity={2.5} color="#74C69D" />
    </group>
  )
}

// Procedural premium glass building placeholder
function BuildingPlaceholder() {
  return (
    <group>
      {/* Base Platform */}
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[4.5, 4.5, 0.2, 64]} />
        <meshStandardMaterial color="#1B4332" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Neon Glow Ring around base */}
      <mesh position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.0, 4.4, 64]} />
        <meshBasicMaterial color="#40916C" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Internal Core (Metal/Dark with some emissive windows simulation) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 4.2, 2.8, 4, 10, 4]} />
        <meshStandardMaterial
          color="#2D6A4F"
          roughness={0.7}
          metalness={0.8}
          wireframe={true} // gives a cool tech/structural look inside the glass
        />
      </mesh>

      {/* Internal Glowing Floors/Lights */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 3.8, 2.5]} />
        <meshStandardMaterial
          color="#081C15"
          emissive="#40916C"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Main Glass Facade */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 4.4, 3.2]} />
        <meshPhysicalMaterial
          color="#95D5B2"
          transmission={0.9}
          opacity={1}
          metalness={0.2}
          roughness={0.05}
          ior={1.5}
          thickness={0.5}
          transparent={true}
        />
      </mesh>
      
      {/* Corner Columns for structure */}
      {[-1.6, 1.6].map((x) => 
        [-1.6, 1.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 4.4, 0.1]} />
            <meshStandardMaterial color="#1B4332" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}
    </group>
  )
}
