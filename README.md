# Avatar Mapper (React, client-only)

Browser-only React app that maps uploaded photos onto a 3D head mesh, allows adjustment, preview, and PNG export at selectable resolutions. Uses mock JSON for presets and example images. Deployable to GitHub Pages.

## Features
- Upload via file dialog or drag-and-drop.
- Map image to 3D head and adjust scale/rotation/translation/blend/lighting.
- Real-time 3D preview with orbit/pan/zoom.
- Export PNG via an off-screen re-render at chosen resolution (512/1024/2048).
- Client-only: photos never leave your browser.
- Deployable to GitHub Pages.

## Local setup

### Prerequisites
- Node 18+ recommended
- Git

### Install & run
```powershell
# from project root
npm install
npm run dev
