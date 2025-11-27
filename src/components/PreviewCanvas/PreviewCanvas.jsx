import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene from './Scene';
import styles from './PreviewCanvas.module.css';
import { useStore } from '../../store/useStore';
import { exportSceneToPNG } from '../../utils/imageUtils';

export default function PreviewCanvas() {
  const canvasRef = useRef();
  const containerRef = useRef();
  const store = useStore();

  // export handler (exposed to ExportPanel via DOM event)
  window.__exportScene = async function exportHandler({ width = 1024, height = 1024, background = '#fff', filename = 'avatar.png' } = {}) {
    // get current scene and camera via a hidden event (we'll use a custom event)
    const event = new CustomEvent('request-scene', { detail: { width, height, background, filename } });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.canvasWrap} ref={containerRef}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 35 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls makeDefault enablePan enableZoom enableRotate />
      </Canvas>
      <div className={styles.hud}>Drag to rotate • Scroll to zoom</div>
    </div>
  );
}
