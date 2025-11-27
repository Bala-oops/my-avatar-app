// src/components/PreviewCanvas/MappedHead.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/**
 * Robust MappedHead:
 * - resolves meshPath relative to import.meta.env.BASE_URL (works on GH Pages)
 * - checks meshPath first (fetch)
 * - if valid, mounts GLTFModel (which uses useGLTF)
 * - otherwise uses textured sphere fallback
 *
 * mapping expects:
 *  { scale, rotation (radians), translateX, translateY, blend, lighting }
 */

/** small helper: resolve a possibly-relative meshPath to include BASE_URL */
function resolvePathWithBase(path) {
  const base = import.meta.env.BASE_URL || "/";
  if (!path) return `${base}assets/meshes/head_neutral.glb`;
  // If path already seems absolute (http(s)://) return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // If path already begins with base, return as-is
  if (path.startsWith(base)) return path;
  // Remove leading slashes from path then join
  return `${base}${path.replace(/^\/+/, "")}`;
}

function GLTFModel({ meshPath, groupRef, mapping, textureRef }) {
  // This component is only mounted when GLB check has passed.
  const gltf = useGLTF(meshPath, true);

  // Track which texture was last applied so we only update materials when it changes
  const lastTexRef = useRef(null);

  useFrame(() => {
    const tex = textureRef.current;
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (!child.isMesh) return;

      // If the texture hasn't changed and there's already a map, skip heavy ops
      if (child.material && child.material.map === tex) {
        // Still update transform if needed
        if (tex) {
          const s = mapping.scale || 1;
          tex.repeat.set(1 / s, 1 / s);
          tex.rotation = mapping.rotation || 0;
          tex.center.set(0.5, 0.5);
          tex.offset.set(0.5 + (mapping.translateX || 0), 0.5 + (mapping.translateY || 0));
          tex.needsUpdate = true;
        }
        return;
      }

      // Store original material if not set
      if (!child.userData._origMaterial) child.userData._origMaterial = child.material;

      if (tex) {
        // Clone material if necessary so we don't mutate shared materials
        let mat = child.material && child.material.clone ? child.material.clone() : new THREE.MeshStandardMaterial({ color: 0xffffff });
        // Ensure base color is neutral so texture shows correctly
        if (mat.color) mat.color.set(0xffffff);

        // Apply texture and safe settings
        mat.map = tex;
        mat.roughness = mat.roughness ?? 0.6;
        mat.metalness = 0;
        mat.needsUpdate = true;

        // Texture transforms
        const s = mapping.scale || 1;
        tex.repeat.set(1 / s, 1 / s);
        tex.rotation = mapping.rotation || 0;
        tex.center.set(0.5, 0.5);
        tex.offset.set(0.5 + (mapping.translateX || 0), 0.5 + (mapping.translateY || 0));
        tex.needsUpdate = true;

        child.material = mat;
        lastTexRef.current = tex;
      } else {
        // no texture: revert to original
        child.material = child.userData._origMaterial || child.material;
        lastTexRef.current = null;
      }
    });
  });

  const scene = gltf?.scene ?? null;
  if (!scene) return null;

  // attach the gltf scene to the provided groupRef so traversal works
  return <primitive object={scene} ref={groupRef} dispose={null} />;
}

export default function MappedHead({
  meshPath = "assets/meshes/head_neutral.glb",
  photoSrc,
  mapping = {},
}) {
  // resolve meshPath against Vite base so it works on GH Pages
  const resolvedMeshPath = resolvePathWithBase(meshPath);

  const [checked, setChecked] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const groupRef = useRef();
  const textureRef = useRef(null);

  // Pre-check the GLB before mounting useGLTF (use resolved path)
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch(resolvedMeshPath, { method: "GET" });
        if (!res.ok) {
          // mark fallback if not found
          if (!canceled) setUseFallback(true);
        } else {
          const buf = await res.arrayBuffer();
          if (buf.byteLength < 100) {
            if (!canceled) setUseFallback(true);
          } else {
            if (!canceled) setUseFallback(false);
          }
        }
      } catch (err) {
        if (!canceled) setUseFallback(true);
      } finally {
        if (!canceled) setChecked(true);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [resolvedMeshPath]);

  // Load the user's photo into a THREE.Texture with proper settings
  useEffect(() => {
    textureRef.current = null;
    if (!photoSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoSrc;

    img.onload = () => {
      const tex = new THREE.Texture(img);

      // Modern colorSpace API with fallback for older three.js
      if ("colorSpace" in tex) {
        // new three.js property
        if (THREE.SRGBColorSpace) {
          tex.colorSpace = THREE.SRGBColorSpace;
        } else {
          tex.encoding = THREE.sRGBEncoding;
        }
      } else {
        // legacy fallback (keeps older three versions working)
        tex.encoding = THREE.sRGBEncoding;
      }

      // IMPORTANT texture settings
      tex.flipY = false; // glTF UVs expect flipY=false
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
      tex.center = new THREE.Vector2(0.5, 0.5);

      // initial transform based on mapping
      const s = mapping.scale || 1;
      tex.repeat.set(1 / s, 1 / s);
      tex.rotation = mapping.rotation || 0;
      tex.offset.set(0.5 + (mapping.translateX || 0), 0.5 + (mapping.translateY || 0));
      tex.needsUpdate = true;

      textureRef.current = tex;
    };

    img.onerror = () => {
      textureRef.current = null;
    };

    return () => {
      // cleanup if needed (uploader should revoke object URLs if used)
    };
    // include mapping props so texture updates when user tweaks
  }, [photoSrc, mapping.scale, mapping.rotation, mapping.translateX, mapping.translateY]);

  // If GLB check hasn't completed, render nothing (allow Suspense fallback to show)
  if (!checked) return null;

  // If GLB missing/corrupt, show textured sphere fallback (texture applied in useFrame below via traversal)
  if (useFallback) {
    // We'll still apply texture transforms each frame so the sphere shows the photo if provided
    useFrame(() => {
      const tex = textureRef.current;
      if (!groupRef.current) return;
      groupRef.current.traverse((child) => {
        if (!child.isMesh) return;
        if (!child.userData._origMaterial) child.userData._origMaterial = child.material;
        if (tex) {
          // apply to the sphere mesh's material
          let mat;
          try {
            mat = child.material.clone ? child.material.clone() : new THREE.MeshStandardMaterial({ color: 0xffffff });
          } catch {
            mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
          }
          if (mat.color) mat.color.set(0xffffff);
          mat.map = tex;
          mat.roughness = mat.roughness ?? 0.6;
          mat.metalness = 0;
          mat.needsUpdate = true;

          const s = mapping.scale || 1;
          tex.repeat.set(1 / s, 1 / s);
          tex.rotation = mapping.rotation || 0;
          tex.center.set(0.5, 0.5);
          tex.offset.set(0.5 + (mapping.translateX || 0), 0.5 + (mapping.translateY || 0));
          tex.needsUpdate = true;

          child.material = mat;
        } else {
          child.material = child.userData._origMaterial || child.material;
        }
      });
    });

    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[0.9, 64, 64]} />
          <meshStandardMaterial />
        </mesh>
      </group>
    );
  }

  // Safe path: mount GLTF model and let GLTFModel handle material updates
  return <GLTFModel meshPath={resolvedMeshPath} groupRef={groupRef} mapping={mapping} textureRef={textureRef} />;
}
