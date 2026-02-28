import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ContactAnalysis } from '@/lib/types';

interface Galaxy3DViewProps {
  contacts: ContactAnalysis[];
  onContactClick: (index: number) => void;
}

const healthHex = (s: number) => {
  if (s >= 75) return "#ffffff";
  if (s >= 48) return "#00d4ff";
  return "#ff4d4d";
};

const healthRGB = (s: number) => {
  // High health (75+): Pure white
  if (s >= 75) return [255, 255, 255];
  // Medium health (48-74): Cyan
  if (s >= 48) return [0, 212, 255];
  // Low health (<48): Red
  return [255, 77, 77];
};

// Ring colors based on health
const getRingColor = (s: number) => {
  // High health (75+): Purple rings
  if (s >= 75) return "#b084ff";
  // Medium health (48-74): Teal/Cyan rings
  if (s >= 48) return "#00bfff";
  // Low health (<48): Red rings
  return "#ff6666";
};

export const Galaxy3DView: React.FC<Galaxy3DViewProps> = ({ contacts, onContactClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredContact, setHoveredContact] = useState<{
    contact: ContactAnalysis;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020209, 0.015);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1000);
    camera.position.set(0, 15, 24);
    camera.lookAt(0, 0, 0);

    const resize = () => {
      if (!containerRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const grp = new THREE.Group();
    scene.add(grp);

    // Add visible orbital rings to show planet paths
    const orbitRadii = [6.5, 10.8, 15.2];
    orbitRadii.forEach((radius) => {
      // Create orbit ring lines
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      const segments = 128;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );
      }
      
      orbitGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(orbitPoints), 3));
      
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x4a5568,
        transparent: true,
        opacity: 0.6,
        linewidth: 1
      });
      
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      grp.add(orbitLine);
      
      // Add glowing orbit ring
      const orbitRingGlow = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.08, radius + 0.08, 128),
        new THREE.MeshBasicMaterial({
          color: 0x64748b,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      orbitRingGlow.rotation.x = Math.PI / 2;
      grp.add(orbitRingGlow);
    });

    // Enhanced Stars
    const sg = new THREE.BufferGeometry();
    const sp = [];
    const colors = [];
    const colorTheme = [new THREE.Color(0xffffff), new THREE.Color(0xa78bfa), new THREE.Color(0x60a5fa), new THREE.Color(0xf472b6)];

    for (let i = 0; i < 3000; i++) {
      sp.push((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
      const c = colorTheme[Math.floor(Math.random() * colorTheme.length)];
      colors.push(c.r, c.g, c.b);
    }
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    sg.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Create a circular simple texture for stars
    const canvasStar = document.createElement('canvas');
    canvasStar.width = 16;
    canvasStar.height = 16;
    const ctxStar = canvasStar.getContext('2d')!;
    const gradStar = ctxStar.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradStar.addColorStop(0, 'rgba(255,255,255,1)');
    gradStar.addColorStop(1, 'rgba(255,255,255,0)');
    ctxStar.fillStyle = gradStar;
    ctxStar.fillRect(0, 0, 16, 16);
    const starTex = new THREE.CanvasTexture(canvasStar);

    const starMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      map: starTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    scene.add(new THREE.Points(sg, starMat));

    // Improved Lighting
    scene.add(new THREE.AmbientLight(0x0f172a, 3.5));
    const spl = new THREE.PointLight(0xffd060, 8, 120);
    grp.add(spl);

    // Add rim lighting to emphasize 3D
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 2);
    rimLight.position.set(-20, 10, -10);
    scene.add(rimLight);

    const rimLight2 = new THREE.DirectionalLight(0xa78bfa, 2);
    rimLight2.position.set(20, -10, 10);
    scene.add(rimLight2);

    // Sun
    const sunM = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0xffd060, emissive: 0xffa500, emissiveIntensity: 2.5, roughness: 0.2 })
    );
    grp.add(sunM);
    // Sun glow
    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.15, side: THREE.BackSide, blending: THREE.AdditiveBlending })
    );
    grp.add(sunGlow);

    // Orbit rings - will be created per planet based on health
    const orbitR = [6.5, 10.8, 15.2];

    const angles: { [id: number]: number } = {};
    const planets: { [id: number]: { mesh: THREE.Mesh, mat: THREE.MeshPhysicalMaterial, atmosphere: THREE.Mesh, sz: number, r: number, selR: THREE.Mesh } } = {};
    const oc = [0, 0, 0];

    contacts.forEach((c, idx) => {
      const oi = idx % 3;
      const total = Math.ceil(contacts.length / 3);
      const a = (oc[oi] / total) * Math.PI * 2;
      oc[oi]++;
      angles[idx] = a;

      const rgb = healthRGB(c.healthScore);
      const col = new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      const sz = 0.35 + (c.healthScore / 100) * 0.85;

      // Upgraded material to PhysicalMaterial for sharper, more realistic look
      const mat = new THREE.MeshPhysicalMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.4,
        roughness: 0.4,
        metalness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
      });

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(sz, 64, 64), mat);
      const r = orbitR[oi];
      mesh.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      mesh.userData = { cIdx: idx };
      grp.add(mesh);

      // Create individual rings for this planet based on health
      const ringColor = getRingColor(c.healthScore);
      const ringColorHex = ringColor.replace('#', '0x');
      const ringColorNum = parseInt(ringColorHex, 16);
      
      // Main ring
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(sz * 1.3, sz * 1.5, 64),
        new THREE.MeshBasicMaterial({
          color: ringColorNum,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      ringMesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      mesh.add(ringMesh);

      // Outer glow ring
      const outerGlowRing = new THREE.Mesh(
        new THREE.RingGeometry(sz * 1.2, sz * 1.6, 64),
        new THREE.MeshBasicMaterial({
          color: ringColorNum,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      outerGlowRing.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      mesh.add(outerGlowRing);

      // Atmosphere effect
      const atmosphereMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0, // Starts invisible
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(sz * 1.5, 32, 32), atmosphereMat);
      mesh.add(atmosphere);

      // Simple selection ring
      const selR = new THREE.Mesh(
        new THREE.RingGeometry(sz * 1.8, sz * 1.95, 64),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      selR.rotation.x = Math.PI / 2;
      mesh.add(selR);

      planets[idx] = { mesh, mat, atmosphere, sz, r, selR };
    });

    // Interaction state
    let drag = false, lx = 0, ly = 0, selIdx: number | null = null, hoverIdx: number | null = null;
    const ray = new THREE.Raycaster();
    const ms = new THREE.Vector2();

    const handleMouseDown = (e: MouseEvent) => {
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const handleMouseUp = () => {
      drag = false;
      canvas.style.cursor = hoverIdx !== null ? "pointer" : "grab";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      ms.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ms.y = -((e.clientY - r.top) / r.height) * 2 + 1;

      if (drag) {
        grp.rotation.y += (e.clientX - lx) * 0.005;
        grp.rotation.x = Math.max(-0.6, Math.min(0.6, grp.rotation.x + (e.clientY - ly) * 0.003));
        lx = e.clientX;
        ly = e.clientY;
      }

      ray.setFromCamera(ms, camera);
      const hits = ray.intersectObjects(Object.values(planets).map(p => p.mesh), true);

      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const cIdx = hitObj.userData.cIdx !== undefined ? hitObj.userData.cIdx : hitObj.parent?.userData?.cIdx;
        if (cIdx !== undefined) {
          hoverIdx = cIdx;
          const c = contacts[cIdx];
          if (!drag) canvas.style.cursor = "pointer";
          setHoveredContact({ contact: c, x: e.clientX, y: e.clientY });
        }
      } else {
        hoverIdx = null;
        setHoveredContact(null);
        if (!drag) canvas.style.cursor = "grab";
      }
    };

    const handleClick = (e: MouseEvent) => {
      ray.setFromCamera(ms, camera);
      const hits = ray.intersectObjects(Object.values(planets).map(p => p.mesh), true);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const cIdx = hitObj.userData.cIdx !== undefined ? hitObj.userData.cIdx : hitObj.parent?.userData?.cIdx;
        if (cIdx !== undefined) {
          if (selIdx === cIdx) {
            selIdx = null; // deselect
          } else {
            selIdx = cIdx;
            onContactClick(cIdx);
          }
        }
      } else {
        selIdx = null;
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    const clk = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clk.getElapsedTime();

      contacts.forEach((c, idx) => {
        const p = planets[idx];
        if (!p) return;

        angles[idx] += (0.01 + (c.healthScore / 100) * 0.02) * 0.02; // Slowed down orbit slightly for smoother feel
        const a = angles[idx];
        p.mesh.position.x = Math.cos(a) * p.r;
        p.mesh.position.z = Math.sin(a) * p.r;
        p.mesh.rotation.y += 0.005;

        const isSelected = idx === selIdx;
        const isHovered = idx === hoverIdx;
        const isLowHealth = c.healthScore < 45;

        // Animate atmosphere pulse
        let targetAtmoOpacity = 0;
        let targetScale = 1;
        let targetEmissive = 0.4;

        if (isSelected) {
          targetAtmoOpacity = 0.6 + Math.sin(t * 4) * 0.2;
          targetScale = 1.3 + Math.sin(t * 2) * 0.05;
          targetEmissive = 1.2;
          p.atmosphere.scale.setScalar(1 + Math.sin(t * 6) * 0.1);
        } else if (isHovered) {
          targetAtmoOpacity = 0.3;
          targetScale = 1.1;
          targetEmissive = 0.8;
          p.atmosphere.scale.setScalar(1);
        } else if (isLowHealth) {
          targetScale = 1 + Math.sin(t * 3.2) * 0.14;
          targetEmissive = 0.5 + Math.abs(Math.sin(t * 3.2)) * 0.4;
        }

        // Smoothly interpolate to targets
        p.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        p.mat.emissiveIntensity += (targetEmissive - p.mat.emissiveIntensity) * 0.1;

        const atmoMat = p.atmosphere.material as THREE.MeshBasicMaterial;
        atmoMat.opacity += (targetAtmoOpacity - atmoMat.opacity) * 0.1;

        const selMat = p.selR.material as THREE.MeshBasicMaterial;
        selMat.opacity += ((isSelected ? 0.8 : 0) - selMat.opacity) * 0.1;

        if (isSelected) {
          p.selR.rotation.x = Math.PI / 2 + Math.sin(t * 2) * 0.1;
          p.selR.rotation.y = Math.cos(t * 2) * 0.1;
        } else {
          p.selR.rotation.x = Math.PI / 2;
          p.selR.rotation.y = 0;
        }
      });

      sunM.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03);
      sunM.rotation.y += 0.002;
      sunGlow.scale.setScalar(1 + Math.sin(t * 1.2) * 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
      scene.clear();
      renderer.dispose();
    };
  }, [contacts, onContactClick]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 30% 40%, rgba(80,20,160,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 75% 25%, rgba(20,80,40,0.15) 0%, transparent 45%),
          radial-gradient(ellipse at 60% 75%, rgba(120,20,60,0.12) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(10,10,40,0.6) 0%, transparent 70%)
        `
      }} />
      <canvas ref={canvasRef} className="absolute inset-0 cursor-grab" />

      {/* Tooltip */}
      {hoveredContact && (
        <div
          className="fixed pointer-events-none z-50 bg-black/90 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all"
          style={{
            left: hoveredContact.x + 16,
            top: hoveredContact.y - 10,
            borderColor: `${healthHex(hoveredContact.contact.healthScore)}44`,
            boxShadow: `0 0 30px ${healthHex(hoveredContact.contact.healthScore)}22`
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div>
              <div className="font-mono-display font-bold text-lg text-white">{hoveredContact.contact.name}</div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: healthHex(hoveredContact.contact.healthScore) }}>
                {hoveredContact.contact.daysSinceLastInteraction === 0 ? "TODAY" : `${hoveredContact.contact.daysSinceLastInteraction}D AGO`}
              </div>
            </div>
            <div className="ml-4 font-mono-display font-black text-2xl" style={{ color: healthHex(hoveredContact.contact.healthScore) }}>
              {hoveredContact.contact.healthScore}
            </div>
          </div>
          <div className="flex gap-3 text-[10px] text-gray-400 font-mono-display mt-3">
            <span>INT: {hoveredContact.contact.interactionCountLast30}</span>
            <span>INIT: {Math.round(hoveredContact.contact.initiationRatio * 100)}%</span>
            <span>TREND: {hoveredContact.contact.frequencyTrendPercent}%</span>
          </div>
          <div className="mt-2 text-[9px] text-gray-500 font-mono-display tracking-widest text-center mt-4">CLICK TO EXPLORE →</div>
        </div>
      )}
    </div>
  );
};
