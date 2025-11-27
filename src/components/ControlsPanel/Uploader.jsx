import React, { useRef } from 'react';
import styles from './Uploader.module.css';
import { loadImageFile } from '../../utils/imageUtils';
import { useStore } from '../../store/useStore';

export default function Uploader() {
  const inputRef = useRef();
  const setCurrentPhoto = useStore((s) => s.setCurrentPhoto);
  const mock = useStore((s) => s.mock);

  const onFile = async (file) => {
    if (!file) return;
    const maxMB = mock?.ui?.maxFileSizeMB || 8;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`File too large (max ${maxMB}MB)`);
      return;
    }
    const meta = await loadImageFile(file);
    setCurrentPhoto(meta);
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className={styles.uploader}>
      <div
        className={styles.dropzone}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        aria-label="Upload photo"
      >
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" onChange={onChange} hidden />
        <div>Click or drag & drop a photo</div>
      </div>

      <div className={styles.example}>
        <div className={styles.sectionTitle}>Example photos</div>
        <div className={styles.thumbs}>
        </div>
      </div>
    </div>
  );
}
