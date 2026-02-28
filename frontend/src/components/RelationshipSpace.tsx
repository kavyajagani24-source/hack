import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Stars, Sparkles, Float, Environment, Effects, Html } from "@react-three/drei";
import { ContactAnalysis } from "@/lib/types";
import * as THREE from "three";

interface ContactSphereProps {
  contact: ContactAnalysis;
  position: [number, number, number];
  onClick: () => void;
}

// Shared animation logic for all bubbles, lines, and names
function getAnimatedPosition(base: [number, number, number], t: number) {
  return [
    base[0] + Math.sin(t * 0.7 + base[0]) * 0.08,
    base[1] + Math.sin(t * 1.2 + base[2]) * 0.09 + Math.cos(t * 0.5 + base[0]) * 0.05,
    base[2] + Math.cos(t * 0.6 + base[1]) * 0.08,
  ] as [number, number, number];
}

function ContactSphere({ contact, position, onClick }: ContactSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const color = useMemo(() => {
    switch (contact.state) {
      case "Thriving": return "#00ff88";
      case "Stable": return "#ffff00";
      case "Drifting": return "#ffaa00";
      case "At Risk": return "#ff2563";
      default: return "#00d9ff";
    }
  }, [contact.state]);
  const size = 0.16;
  const [animatedPos, setAnimatedPos] = useState<[number, number, number]>(position);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = getAnimatedPosition(position, t);
    setAnimatedPos(pos);
    if (meshRef.current) {
      meshRef.current.position.set(...pos);
      const scale = 1 + Math.sin(t * 2.5 + position[0]) * 0.07 + (hovered ? 0.12 : 0);
      meshRef.current.scale.setScalar(scale);
    }
  });
  return (
    <group>
      {/* Glowing trail */}
      <Sparkles count={12} scale={[size*2.8, size*2.8, size*2.8]} color={color} speed={1.2} opacity={0.8} position={animatedPos} />
      {/* Main orb */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.6 : 1.0}
          roughness={0.08}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.9}
          thickness={0.9}
          ior={1.5}
          reflectivity={0.95}
          opacity={0.98}
          transparent
        />
      </mesh>
      {/* Name label - always follows bubble */}
      <Text
        position={[animatedPos[0], animatedPos[1] + size + 0.09, animatedPos[2]]}
        fontSize={0.12}
        color={hovered ? "#ffffff" : color}
        anchorX="center"
        anchorY="bottom"
        outlineColor="#000"
        outlineWidth={0.014}
        billboard
        style={{ textShadow: `0 0 8px ${color}88` }}
      >
        {contact.name}
      </Text>
    </group>
  );
}

function CenterNode() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  return (
    <group>
      {/* Central sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.45, 48, 48]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function ConnectionLine({ contact, position }: { contact: ContactAnalysis; position: [number, number, number] }) {
  // Animated glowing line, always follows the animated bubble position
  const color = contact.state === "Thriving" ? "#00ff88"
    : contact.state === "Stable" ? "#ffff00"
    : contact.state === "Drifting" ? "#ffaa00"
    : "#ff2563";
  const [animatedPos, setAnimatedPos] = useState<[number, number, number]>(position);
  useFrame((state) => {
    setAnimatedPos(getAnimatedPosition(position, state.clock.elapsedTime));
  });
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...animatedPos)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [animatedPos]);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color={color} linewidth={3} transparent opacity={0.48} />
    </line>
  );
}

function ConnectionLines({ contacts, positions }: { contacts: ContactAnalysis[]; positions: [number, number, number][] }) {
  return (
    <>
      {contacts.map((contact, i) => (
        <ConnectionLine key={i} contact={contact} position={positions[i]} />
      ))}
    </>
  );
}

interface RelationshipSpaceProps {
  contacts: ContactAnalysis[];
  onSelectContact: (contact: ContactAnalysis) => void;
  onExit: () => void;
}

export function RelationshipSpace({ contacts, onSelectContact, onExit }: RelationshipSpaceProps) {
  // Arrange contacts in orbital rings around the central sun
  const rings = [1.2, 1.8, 2.4];
  const positions: [number, number, number][] = [];
  const contactOrder: ContactAnalysis[] = [];
  let idx = 0;
  for (let r = 0; r < rings.length; r++) {
    const ringContacts = contacts.slice(idx, idx + Math.ceil(contacts.length / rings.length));
    for (let i = 0; i < ringContacts.length; i++) {
      const angle = (i / ringContacts.length) * Math.PI * 2;
      const x = Math.cos(angle) * rings[r];
      const z = Math.sin(angle) * rings[r];
      positions.push([x, 0.1, z]);
      contactOrder.push(ringContacts[i]);
    }
    idx += ringContacts.length;
  }

  return (
    <div className="fixed inset-0 z-40" style={{background: "radial-gradient(ellipse at 60% 40%, #181e2a 60%, #0f172a 100%)"}}>
      {/* Space background and orbital rings overlay */}
      <canvas id="nebula-bg" style={{position:'absolute',zIndex:0,width:'100%',height:'100%',pointerEvents:'none',mixBlendMode:'screen',opacity:0.7}} />
      <button
        onClick={onExit}
        className="absolute top-6 left-6 z-50 px-5 py-2 rounded-xl bg-black/60 text-white text-base font-bold border border-cyan-400 shadow-lg hover:bg-cyan-900/80 transition-all backdrop-blur"
      >
        ← Dashboard
      </button>
      <div className="absolute top-6 right-6 z-50 text-lg text-cyan-300 font-mono tracking-widest drop-shadow-lg select-none">
        AR RELATIONSHIP GALAXY
      </div>
      <Canvas camera={{ position: [0, 2.5, 7], fov: 48 }} shadows>
        {/* Space background */}
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 7, 18]} />
        <Stars radius={60} depth={80} count={1800} factor={2.2} saturation={1} fade speed={1.7} />
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 6, 0]} intensity={2.0} color="#ffff00" castShadow />
        <CenterNode />
        {/* Orbital rings */}
        {rings.map((radius, i) => (
          <mesh key={i} position={[0, 0.09, 0]}>
            <torusGeometry args={[radius, 0.01, 16, 100]} />
            <meshBasicMaterial color="#00d9ff" transparent opacity={0.28} />
          </mesh>
        ))}
        {/* Bubbles and lines */}
        {contactOrder.map((contact, i) => (
          <ContactSphere
            key={contact.name}
            contact={contact}
            position={positions[i]}
            onClick={() => onSelectContact(contact)}
          />
        ))}
        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={16}
          autoRotate
          autoRotateSpeed={0.7}
        />
        {/* Postprocessing effects (bloom, etc.) */}
        <Effects>
          {/* Add bloom or other effects here if desired */}
        </Effects>
      </Canvas>
    </div>
  );
}
