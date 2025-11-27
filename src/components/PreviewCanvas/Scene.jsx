import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import MappedHead from './MappedHead';
import * as THREE from 'three';
import { exportSceneToPNG, downloadDataUrl } from '../../utils/imageUtils';

export default function Scene() {
  const { scene, camera, gl } = useThree();
  const mock = useStore((s) => s.mock);
  const mapping = useStore((s) => s.mapping);
  const currentPhoto = useStore((s) => s.currentPhoto);

  useEffect(() => {
    // event listener: export request
    const handler = async (e) => {
      const { width, height, background, filename } = e.detail || {};
      // call export util with scene & camera
      try {
        const dataUrl = await exportSceneToPNG({ scene, camera, width, height, background: background === 'transparent' ? 'transparent' : background });
        downloadDataUrl(dataUrl, filename || `avatar_${width}x${height}.png`);
      } catch (err) {
        console.error('Export failed', err);
      }
    };
    window.addEventListener('request-scene', handler);
    return () => window.removeEventListener('request-scene', handler);
  }, [scene, camera]);

  // lights (react-three)
  return (
    <>
      <ambientLight intensity={0.4 * (mapping.lighting?.intensity || 1)} />
      <directionalLight position={[5, 5, 5]} intensity={1.2 * (mapping.lighting?.intensity || 1)} />
      <MappedHead meshPath={mock?.presets?.[0]?.meshPath} photoSrc={currentPhoto?.src} mapping={mapping} />
    </>
  );
}
