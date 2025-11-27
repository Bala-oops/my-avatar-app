// src/components/ControlsPanel/TransformControls.jsx
import React from 'react';
import styles from './TransformControls.module.css';
import { useStore } from '../../store/useStore';
import AutoFit from './AutoFit';

export default function TransformControls() {
  const mapping = useStore((s) => s.mapping);
  const setMapping = useStore((s) => s.setMapping);
  const resetMapping = useStore((s) => s.resetMapping);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  // safe rotation deg getter (mapping.rotation may be undefined)
  const rotationDeg = Number.isFinite(mapping.rotation) ? (mapping.rotation * 180) / Math.PI : 0;

  return (
    <div className={styles.controls} aria-label="Transform controls">
      <h4>Transform</h4>

      <label>
        <div className={styles.labelRow}>Scale</div>
        <input
          aria-label="Scale slider"
          type="range"
          min="0.25"
          max="4"
          step="0.01"
          value={mapping.scale}
          onChange={(e) => setMapping({ scale: parseFloat(e.target.value) })}
        />
        <input
          aria-label="Scale number"
          type="number"
          value={mapping.scale}
          step="0.01"
          onChange={(e) => setMapping({ scale: parseFloat(e.target.value || 1) })}
        />
      </label>

      <label>
        <div className={styles.labelRow}>Rotation (deg)</div>
        <input
          aria-label="Rotation slider"
          type="range"
          min="-180"
          max="180"
          step="1"
          value={rotationDeg}
          onChange={(e) => setMapping({ rotation: (parseFloat(e.target.value) * Math.PI) / 180 })}
        />
        <input
          aria-label="Rotation number"
          type="number"
          value={rotationDeg}
          step="1"
          onChange={(e) => setMapping({ rotation: (parseFloat(e.target.value || 0) * Math.PI) / 180 })}
        />
      </label>

      <label>
        <div className={styles.labelRow}>Translate X</div>
        <input
          aria-label="Translate X"
          type="range"
          min="-1"
          max="1"
          step="0.001"
          value={mapping.translateX}
          onChange={(e) => setMapping({ translateX: parseFloat(e.target.value) })}
        />
        <input
          aria-label="Translate X number"
          type="number"
          value={mapping.translateX}
          step="0.001"
          onChange={(e) => setMapping({ translateX: parseFloat(e.target.value || 0) })}
        />
      </label>

      <label>
        <div className={styles.labelRow}>Translate Y</div>
        <input
          aria-label="Translate Y"
          type="range"
          min="-1"
          max="1"
          step="0.001"
          value={mapping.translateY}
          onChange={(e) => setMapping({ translateY: parseFloat(e.target.value) })}
        />
        <input
          aria-label="Translate Y number"
          type="number"
          value={mapping.translateY}
          step="0.001"
          onChange={(e) => setMapping({ translateY: parseFloat(e.target.value || 0) })}
        />
      </label>

      <div className={styles.actions}>
        {/* Auto-fit button aligns photo to head automatically */}
        <AutoFit className={styles.btn} />

        {/* Reset mapping to defaults (uses store resetMapping to keep history) */}
        <button
          className={styles.btn}
          onClick={() => {
            resetMapping();
          }}
          aria-label="Reset mapping"
        >
          Reset
        </button>

        <button className={styles.btn} onClick={undo} aria-label="Undo last mapping change">
          Undo
        </button>

        <button className={styles.btn} onClick={redo} aria-label="Redo mapping change">
          Redo
        </button>
      </div>
    </div>
  );
}
