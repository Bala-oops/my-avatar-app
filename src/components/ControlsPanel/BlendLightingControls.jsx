// src/components/ControlsPanel/BlendLightingControls.jsx
import React from 'react';
import styles from './BlendLightingControls.module.css';
import { useStore } from '../../store/useStore';

export default function BlendLightingControls() {
  const mapping = useStore((s) => s.mapping);
  const setMapping = useStore((s) => s.setMapping);

  return (
    <div className={styles.blend}>
      <h4>Blend & Lighting</h4>

      <label>
        <div>Blend</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={mapping.blend ?? 1}
          onChange={(e) => setMapping({ blend: parseFloat(e.target.value) })}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={mapping.blend ?? 1}
        />
      </label>

      <label>
        <div>Light Intensity</div>
        <input
          type="range"
          min="0"
          max="3"
          step="0.01"
          value={mapping.lighting?.intensity ?? 1}
          onChange={(e) => setMapping({ lighting: { ...mapping.lighting, intensity: parseFloat(e.target.value) } })}
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={mapping.lighting?.intensity ?? 1}
        />
      </label>
    </div>
  );
}
