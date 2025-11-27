import React from 'react';
import styles from './ExportPanel.module.css';
import { useStore } from '../../store/useStore';

export default function ExportPanel() {
  const [res, setRes] = React.useState(1024);
  const [background, setBackground] = React.useState('#ffffff');
  const currentPhoto = useStore((s) => s.currentPhoto);

  const onDownload = () => {
    if (!currentPhoto) {
      alert('Please upload or choose a photo first');
      return;
    }
    // trigger scene export
    const evt = new CustomEvent('request-scene', { detail: { width: res, height: res, background: background === 'transparent' ? 'transparent' : background, filename: `avatar_${res}.png` } });
    window.dispatchEvent(evt);
  };

  return (
    <div className={styles.export}>
      <h4>Export</h4>

      <label>
        Resolution
        <select value={res} onChange={(e) => setRes(parseInt(e.target.value, 10))}>
          <option value={512}>512</option>
          <option value={1024}>1024</option>
          <option value={2048}>2048</option>
        </select>
      </label>

      <label>
        Background
        <select value={background} onChange={(e) => setBackground(e.target.value)}>
          <option value="#ffffff">White</option>
          <option value="#000000">Black</option>
          <option value="transparent">Transparent</option>
        </select>
      </label>

      <div style={{ marginTop: 12 }}>
        <button onClick={onDownload} disabled={!currentPhoto}>
          Download PNG
        </button>
      </div>
    </div>
  );
}
