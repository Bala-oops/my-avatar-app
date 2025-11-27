import * as THREE from 'three';

/** load file -> object URL */
export async function loadImageFile(file) {
  if (!file) throw new Error('No file');
  const id = `uploaded_${Date.now()}`;
  const src = URL.createObjectURL(file);
  return { id, src, fileName: file.name, fileSize: file.size };
}

/** create a THREE.Texture from a URL/objectURL */
export function createThreeTextureFromSrc(src, onLoad = () => {}) {
  const loader = new THREE.ImageLoader();
  const texture = new THREE.Texture();
  loader.load(
    src,
    (img) => {
      texture.image = img;
      texture.needsUpdate = true;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.center = new THREE.Vector2(0.5, 0.5);
      onLoad(texture);
    },
    undefined,
    (err) => console.error('image load err', err)
  );
  return texture;
}

/**
 * exportSceneToPNG - re-render the provided scene/camera at an arbitrary resolution using an offscreen renderer.
 * Arguments:
 *  - scene: THREE.Scene (or group)
 *  - camera: THREE.Camera
 *  - width, height: desired pixel dimensions
 */
export async function exportSceneToPNG({ scene, camera, width = 1024, height = 1024, background = null }) {
  // Create an offscreen renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);

  // Clone scene? We'll render the original scene object directly (safest with original materials)
  // Temporarily override scene background if requested
  const oldBg = scene.background;
  scene.background = background === 'transparent' ? null : new THREE.Color(background || 0xffffff);

  // Ensure camera aspect matches
  const oldAspect = camera.aspect;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // Render
  renderer.render(scene, camera);

  // Read dataURL
  const dataURL = renderer.domElement.toDataURL('image/png');

  // Cleanup and restore
  camera.aspect = oldAspect;
  camera.updateProjectionMatrix();
  scene.background = oldBg;
  renderer.dispose();

  return dataURL;
}

export function downloadDataUrl(dataUrl, filename = 'avatar.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
