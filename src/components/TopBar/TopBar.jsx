import React from 'react';
import styles from './TopBar.module.css';
import { useStore } from '../../store/useStore';

export default function TopBar() {
  const currentPhoto = useStore((s) => s.currentPhoto);
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>Avatar Mapper</div>
      <div className={styles.right}>
        <div className={styles.note}>Images stay in your browser</div>
        <div className={styles.photo}>{currentPhoto ? currentPhoto.fileName || currentPhoto.id : 'No photo'}</div>
      </div>
    </header>
  );
}
