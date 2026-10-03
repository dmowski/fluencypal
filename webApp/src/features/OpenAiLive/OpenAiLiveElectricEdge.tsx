'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const pointOnCard = (distance: number, width: number, height: number): [number, number] => {
  const radius = 19;
  const x = 1.5;
  const y = 1.5;
  const innerWidth = width - 3;
  const innerHeight = height - 3;
  const straightX = innerWidth - 2 * radius;
  const straightY = innerHeight - 2 * radius;
  const corner = (Math.PI * radius) / 2;
  const lengths = [straightX, corner, straightY, corner, straightX, corner, straightY, corner];
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = ((distance % total) + total) % total;
  let segment = 0;
  while (segment < 7 && remaining > lengths[segment]) {
    remaining -= lengths[segment];
    segment += 1;
  }
  if (segment === 0) return [x + radius + remaining, y];
  if (segment === 2) return [x + innerWidth, y + radius + remaining];
  if (segment === 4) return [x + innerWidth - radius - remaining, y + innerHeight];
  if (segment === 6) return [x, y + innerHeight - radius - remaining];
  const angles = [0, -Math.PI / 2, 0, 0, 0, Math.PI / 2, 0, Math.PI];
  const centersX = [
    0,
    x + innerWidth - radius,
    0,
    x + innerWidth - radius,
    0,
    x + radius,
    0,
    x + radius,
  ];
  const centersY = [
    0,
    y + radius,
    0,
    y + innerHeight - radius,
    0,
    y + innerHeight - radius,
    0,
    y + radius,
  ];
  return [
    centersX[segment] + radius * Math.cos(angles[segment] + remaining / radius),
    centersY[segment] + radius * Math.sin(angles[segment] + remaining / radius),
  ];
};

export const OpenAiLiveElectricEdge = ({ card }: { card: HTMLElement | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !card) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = card.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      if (width > 80 && height > 80) {
        const length = 2 * (width + height - 6 - 76) + 2 * Math.PI * 19;
        const head = (time * 0.085) % length;
        for (let pass = 0; pass < 2; pass += 1) {
          context.beginPath();
          for (let step = 0; step <= 100; step += 2) {
            const point = pointOnCard(head - step, width, height);
            const jitter =
              Math.sin(step * 1.7 + time * 0.007) *
              Math.sin((step / 100) * Math.PI) *
              (pass ? 1.1 : 0.8);
            if (step === 0) context.moveTo(point[0], point[1]);
            else context.lineTo(point[0] + jitter, point[1] + jitter);
          }
          context.strokeStyle = pass ? '#8ce7ff' : '#27b9f0';
          context.lineWidth = pass ? 1.1 : 2;
          context.shadowColor = '#35caff';
          context.shadowBlur = pass ? 3 : 10;
          context.stroke();
        }
        context.shadowBlur = 0;
      }
      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      window.cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
      if (!reduced.matches) frame = window.requestAnimationFrame(draw);
    };

    resize();
    start();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced.matches) context.clearRect(0, 0, width, height);
    });
    observer.observe(card);
    reduced.addEventListener('change', start);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener('change', start);
    };
  }, [card]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
};
