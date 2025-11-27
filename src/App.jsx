import React, { useEffect } from 'react';
import TopBar from './components/TopBar/TopBar';
import Uploader from './components/ControlsPanel/Uploader';
import TransformControls from './components/ControlsPanel/TransformControls';
import BlendLightingControls from './components/ControlsPanel/BlendLightingControls';
import PreviewCanvas from './components/PreviewCanvas/PreviewCanvas';
import ExportPanel from './components/ExportPanel/ExportPanel';
import { useStore } from './store/useStore';
import './styles/globals.css';

export default function App() {
  const setMock = useStore((s) => s.setMock);
  const restore = useStore((s) => s.restoreFromStorage);

  useEffect(() => {
    fetch('/mock/data.json')
      .then((r) => r.json())
      .then((d) => setMock(d))
      .catch((e) => console.error('Failed to load mock data', e));
    // restore mapping/photo from localStorage if any
    restore();
  }, [setMock, restore]);

  return (
    <div className="appRoot">
      <TopBar />
      <main className="mainGrid" role="main">
        <aside className="leftPanel">
          <Uploader />
          <TransformControls />
          <BlendLightingControls />
        </aside>

        <section className="centerPanel">
          <PreviewCanvas />
        </section>

        <aside className="rightPanel">
          <ExportPanel />
        </aside>
      </main>
    </div>
  );
}
