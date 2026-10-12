import { useEffect, useRef } from "react";

export default function ParticleRing() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0, height = 0;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize(); addEventListener("resize", resize);
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = reduced ? 0 : time / 12000;
      const spread = reduced ? 0 : Math.min(scrollY / height, 1.8);
      const radius = Math.min(width * .42, 310) * (1 + spread * .55);
      const points = Array.from({ length: 150 }, (_, i) => {
        const angle = i * Math.PI * 2 / 150 + t;
        const wave = Math.sin(i * 2.4 + t * 3) * 35;
        return { x: width / 2 + Math.cos(angle) * (radius + wave), y: height * .43 + Math.sin(angle) * (radius * .64 + wave) + Math.sin(t * 2 + i) * 12 };
      });
      points.forEach((point, i) => {
        ctx.fillStyle = i % 3 ? "rgba(58,87,232,.32)" : "rgba(121,40,202,.3)";
        ctx.beginPath(); ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const next = points[j], distance = Math.hypot(point.x - next.x, point.y - next.y);
          if (distance > 62) continue;
          ctx.strokeStyle = `rgba(58,87,232,${.11 * (1 - distance / 62)})`;
          ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y); ctx.stroke();
        }
      });
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="particle-ring" aria-hidden="true" />;
}
