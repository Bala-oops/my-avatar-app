// src/components/ControlsPanel/AutoFit.jsx
import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { useStore } from '../../store/useStore';

/**
 * Resilient AutoFit:
 *  - Tries detection with flipHorizontal=false, then true
 *  - Uses landmarks when available, otherwise boundingBox
 *  - If everything fails, falls back to image-center heuristic
 *  - Applies mapping via setMapping(..., { snapshot: true })
 */
export default function AutoFit({ className }) {
  const currentPhoto = useStore((s) => s.currentPhoto);
  const setMapping = useStore((s) => s.setMapping);
  const [loading, setLoading] = useState(false);

  async function tryDetect(detector, img, flip) {
    try {
      // modern API: pass the image element directly
      const preds = await detector.estimateFaces(img, { flipHorizontal: flip });
      return preds;
    } catch (err) {
      console.warn('Detection attempt failed:', err);
      return null;
    }
  }

  function applyMappingFromLandmarks(img, p) {
    // prefer scaledMesh (MediaPipe) or landmarks (fallback)
    const lmSource = p.scaledMesh ?? p.landmarks ?? null;
    const lm = (i) => (lmSource && lmSource[i]) || null;

    // common MediaPipe indices
    const LEFT_EYE_INDEX = 33;
    const RIGHT_EYE_INDEX = 263;
    const NOSE_TIP_INDEX = 1;

    const leftEye = lm(LEFT_EYE_INDEX);
    const rightEye = lm(RIGHT_EYE_INDEX);
    const noseTip = lm(NOSE_TIP_INDEX);

    if (leftEye && rightEye) {
      const cx = (leftEye[0] + rightEye[0]) / 2;
      const cy = (leftEye[1] + rightEye[1]) / 2;
      const dx = rightEye[0] - leftEye[0];
      const dy = rightEye[1] - leftEye[1];
      const eyeDist = Math.hypot(dx, dy);
      const rotation = Math.atan2(dy, dx);
      const desiredEyeFraction = 0.28;
      const d_norm = eyeDist / img.width;
      const scale = d_norm > 0 ? desiredEyeFraction / d_norm : 1;
      const centerU = cx / img.width;
      const centerV = 1 - cy / img.height;
      const translateX = centerU - 0.5;
      const translateY = centerV - 0.5;
      setMapping({ scale, rotation, translateX, translateY }, { snapshot: true });
      return true;
    }
    return false;
  }

  function applyMappingFromBox(img, box) {
    // box.topLeft / bottomRight arrays if available
    const tl = box.topLeft;
    const br = box.bottomRight;
    const cx = (tl[0] + br[0]) / 2;
    const cy = (tl[1] + br[1]) / 2;
    const w = Math.abs(br[0] - tl[0]);
    const h = Math.abs(br[1] - tl[1]);
    const desiredFaceFrac = 0.36;
    const d_norm = Math.max(w, h) / img.width;
    const scale = d_norm > 0 ? desiredFaceFrac / d_norm : 1;
    const centerU = cx / img.width;
    const centerV = 1 - cy / img.height;
    const translateX = centerU - 0.5;
    const translateY = centerV - 0.5;
    setMapping({ scale, rotation: 0, translateX, translateY }, { snapshot: true });
  }

  function applyCenterFallback(img) {
    // fallback: center the photo with conservative scale
    const defaultScale = 1.2; // make face somewhat larger by default; user can tune
    setMapping({ scale: defaultScale, rotation: 0, translateX: 0, translateY: 0 }, { snapshot: true });
  }

  async function runAutoFit() {
    if (!currentPhoto?.src) {
      alert('Please upload or choose a photo first.');
      return;
    }
    setLoading(true);

    let detector = null;
    try {
      await tf.setBackend('webgl');
      await tf.ready();

      const model =
        faceLandmarksDetection.SupportedModels?.MediaPipeFaceMesh ??
        faceLandmarksDetection.SupportedModels?.mediapipeFacemesh;
      if (!model) throw new Error('Face-landmarks model not available in this package version.');

      // create detector
      detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'tfjs',
        maxFaces: 1,
        refineLandmarks: true
      });

      // prepare image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentPhoto.src;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error('Failed to load image for detection'));
      });

      // Try without flipping first
      let preds = await tryDetect(detector, img, false);

      // If nothing or incomplete, try flipped (some selfies are mirrored)
      if (!preds || !preds.length) {
        console.info('No predictions with flip=false; trying flip=true');
        preds = await tryDetect(detector, img, true);
      }

      // If still no predictions, try to use boundingBox returned by older APIs in p.boundingBox
      if (!preds || !preds.length) {
        console.info('No facial landmarks found; falling back to bounding box detection attempts (if available).');
        // Some predictions may be empty; detector may still return a legacy structure — call estimateFaces again to inspect
        preds = await tryDetect(detector, img, false);
      }

      if (preds && preds.length) {
        const p = preds[0];
        const didLandmarks = applyMappingFromLandmarks(img, p);
        if (didLandmarks) {
          console.info('AutoFit: used landmarks');
          setLoading(false);
          await detector.dispose();
          return;
        }

        // Try boundingBox fallback if available
        if (p.boundingBox && p.boundingBox.topLeft && p.boundingBox.bottomRight) {
          applyMappingFromBox(img, p.boundingBox);
          console.info('AutoFit: used bounding box');
          setLoading(false);
          await detector.dispose();
          return;
        }

        // Some model versions return `box` or `box.rect` — attempt to discover common shapes
        if (p.box && p.box.topLeft && p.box.bottomRight) {
          applyMappingFromBox(img, p.box);
          console.info('AutoFit: used p.box');
          setLoading(false);
          await detector.dispose();
          return;
        }
      }

      // Final fallback: apply center heuristic and inform user
      console.warn('AutoFit: failed to find required landmarks or bounding box; applying center fallback.');
      applyCenterFallback({ width: img.width, height: img.height });
      alert('Auto-fit could not detect a clear face in this photo. We applied a center fallback — please adjust the mapping manually using the controls.');
      setLoading(false);
      await detector.dispose();
    } catch (err) {
      console.error('AutoFit failed', err);
      // As a last resort apply center fallback so user can continue
      applyCenterFallback({ width: 800, height: 800 });
      alert('Auto-fit failed due to an error; a conservative center fit was applied. Please adjust manually if needed. See console for details.');
      setLoading(false);
      if (detector && detector.dispose) await detector.dispose();
    }
  }

  return (
    <button className={className} onClick={runAutoFit} disabled={loading}>
      {loading ? 'Auto-fitting…' : 'Auto-fit'}
    </button>
  );
}
