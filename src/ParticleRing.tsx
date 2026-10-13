import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; phase: number };
type Point = { x: number; y: number; size: number; alpha: number };
export default function ParticleRing() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastDraw = -Infinity;
    let width = 0, height = 0;
    let particles: Particle[] = [];
    let pointer: { x: number; y: number } | null = null;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 480 : 900;
      if (particles.length === count) return;
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * .985;
        const direction = Math.random() * Math.PI * 2;
        const speed = .018 + Math.random() * .028;
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
          vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed,
          phase: Math.random() * Math.PI * 2 };
      });
    };
    const draw = (time: number) => {
      if (!motion.matches) frame = requestAnimationFrame(draw);
      if (!motion.matches && (document.hidden || time - lastDraw < 1000 / 30)) return;
      const dt = Number.isFinite(lastDraw) ? Math.min((time - lastDraw) / 1000, .05) : 0;
      lastDraw = time;
      ctx.clearRect(0, 0, width, height);
      const spread = motion.matches ? 0 : Math.min(scrollY / height, 1.8);
      const mobile = width < 700;
      const radius = Math.min(width * .48, 530) * (1 + spread * .45);
      const centerX = width / 2, centerY = height * .49;
      const mouseX = pointer ? (pointer.x - centerX) / radius : 0;
      const mouseY = pointer ? (pointer.y - centerY) / radius : 0;
      const hoverRadius = (mobile ? 85 : 130) / radius;
      const pointerInside = pointer && Math.hypot(mouseX, mouseY) < 1;
      const points: Point[] = particles.map(particle => {
        if (!motion.matches && dt) {
          // Small random turns produce smooth individual wandering, not rotation.
          particle.vx += (Math.random() - .5) * .035 * dt;
          particle.vy += (Math.random() - .5) * .035 * dt;
          if (pointerInside) {
            const dx = particle.x - mouseX, dy = particle.y - mouseY;
            const distance = Math.hypot(dx, dy);
            if (distance < hoverRadius) {
              const force = (1 - distance / hoverRadius) * .65 * dt;
              const angle = distance > .001 ? Math.atan2(dy, dx) : particle.phase;
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
            }
          }
          // Let the hover push settle gradually back to the drifting speed.
          const speed = Math.hypot(particle.vx, particle.vy);
          const maxSpeed = pointerInside ? .22 : .065;
          if (speed > maxSpeed) {
            const damping = Math.max(maxSpeed / speed, 1 - dt * 3);
            particle.vx *= damping; particle.vy *= damping;
          }
          particle.x += particle.vx * dt; particle.y += particle.vy * dt;
          const distance = Math.hypot(particle.x, particle.y);
          if (distance > .99) {
            const nx = particle.x / distance, ny = particle.y / distance;
            particle.x = nx * .99; particle.y = ny * .99;
            const outward = particle.vx * nx + particle.vy * ny;
            if (outward > 0) { particle.vx -= 2 * outward * nx; particle.vy -= 2 * outward * ny; }
          }
        }
        const distance = Math.hypot(particle.x, particle.y);
        return { x: centerX + particle.x * radius, y: centerY + particle.y * radius,
          size: .9 + (Math.sin(particle.phase) + 1) * .45,
          alpha: .22 + distance * .32 };
      });
      // Check nearby cells, with at most four connections per particle.
      const reach = mobile ? 32 : 48;
      const grid = new Map<string, number[]>();
      points.forEach((point, index) => {
        const key = `${Math.floor(point.x / reach)},${Math.floor(point.y / reach)}`;
        const bucket = grid.get(key);
        if (bucket) bucket.push(index); else grid.set(key, [index]);
      });
      ctx.lineWidth = .65;
      points.forEach((point, i) => {
        const cellX = Math.floor(point.x / reach), cellY = Math.floor(point.y / reach);
        let connections = 0;
        neighbours: for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          for (const j of grid.get(`${cellX + dx},${cellY + dy}`) || []) {
            if (j <= i) continue;
            const next = points[j], distance = Math.hypot(point.x - next.x, point.y - next.y);
            if (distance > reach) continue;
            ctx.strokeStyle = `rgba(129,140,248,${.2 * (1 - distance / reach)})`;
            ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y); ctx.stroke();
            if (++connections === 4) break neighbours;
          }
        }
        ctx.fillStyle = i % 9 === 0 ? `rgba(0,245,212,${point.alpha * .7})` : i % 3 === 0 ? `rgba(192,132,252,${point.alpha})` : `rgba(129,140,248,${point.alpha})`;
        ctx.beginPath(); ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2); ctx.fill();
      });
    };
    const refresh = () => {
      cancelAnimationFrame(frame); lastDraw = -Infinity; frame = requestAnimationFrame(draw);
    };
    const onResize = () => { resize(); refresh(); };
    const onPointerMove = (event: PointerEvent) => { if (event.pointerType !== "touch") pointer = {x:event.clientX,y:event.clientY}; };
    // Passive touch listeners keep following a finger even during native scrolling.
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      pointer = touch ? {x:touch.clientX,y:touch.clientY} : null;
    };
    const clearPointer = () => { pointer = null; };
    const onPointerOut = (event: PointerEvent) => { if (!event.relatedTarget) clearPointer(); };
    resize(); refresh();
    addEventListener("resize", onResize);
    addEventListener("pointermove", onPointerMove, {passive:true});
    addEventListener("pointerout", onPointerOut);
    addEventListener("touchstart", onTouch, {passive:true});
    addEventListener("touchmove", onTouch, {passive:true});
    addEventListener("touchend", onTouch, {passive:true});
    addEventListener("touchcancel", clearPointer, {passive:true});
    addEventListener("blur", clearPointer);
    motion.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(frame); removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointerMove); removeEventListener("pointerout", onPointerOut);
      removeEventListener("touchstart", onTouch); removeEventListener("touchmove", onTouch);
      removeEventListener("touchend", onTouch); removeEventListener("touchcancel", clearPointer);
      removeEventListener("blur", clearPointer); motion.removeEventListener("change", refresh);
    };
  }, []);
  return <canvas ref={ref} className="particle-ring" aria-hidden="true" />;
}
