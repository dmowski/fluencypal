'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { AuroraController, AuroraMode, startAurora } from './aurora';

export const DemoAurora = ({
  mode,
  burstOnMount = false,
  zIndex = 1,
}: {
  mode: AuroraMode;
  burstOnMount?: boolean;
  zIndex?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const auroraRef = useRef<AuroraController | null>(null);
  const modeRef = useRef(mode);
  const burstRef = useRef(burstOnMount);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const aurora = startAurora(canvas);
    aurora.setMode(modeRef.current);
    if (burstRef.current) aurora.burst();
    auroraRef.current = aurora;
    return () => {
      aurora.destroy();
      auroraRef.current = null;
    };
  }, []);

  useEffect(() => {
    auroraRef.current?.setMode(mode);
  }, [mode]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden
      sx={{
        display: 'block',
        pointerEvents: 'none',
        filter: 'blur(36px)',

        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        width: '100%',
        height: 'min(52vh, 480px)',
      }}
    />
  );
};
