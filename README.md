# 🧑‍🎨 3D Avatar Generator (Photo → 3D Head Mapping)

A fully client-side React application that allows users to:

* Upload a face photo
* Map it onto a **3D head model** (GLB)
* Auto-fit the texture using basic landmark detection
* Manually adjust scale / rotation / translation
* Preview the avatar in real-time (Three.js + R3F)
* Export the final screenshot
* Runs **entirely in the browser** – no backend required
* Deployable on **GitHub Pages**

---

## 🚀 Live Demo

> (https://bala-oops.github.io/my-avatar-app/)

---

## 📦 Tech Stack Used

### **Frontend**

* **React (Vite)**
* **JavaScript (ES2020+)**
* **Three.js** for 3D rendering
* **@react-three/fiber** for React bindings
* **@react-three/drei** for helpers
* **Zustand** for global state
* **CSS Modules** for styling
* **Mock JSON data** (no backend)

### **Face Auto-Fit**

* **TensorFlow.js**
* **@tensorflow-models/face-landmarks-detection**
* Lightweight auto-fit that adjusts:

  * translateX
  * translateY
  * scale
  * rotation

---

## 📁 Project Structure

```
src/
 ├── components/
 │    ├── ControlsPanel/
 │    │     ├── TransformControls.jsx
 │    │     ├── AutoFit.jsx
 │    │     ├── Uploader.jsx
 │    │     ├── *.module.css
 │    ├── PreviewCanvas/
 │    │     ├── MappedHead.jsx
 │    │     ├── Scene.jsx
 │    │     ├── PreviewCanvas.module.css
 │    ├── ExportPanel/
 │    └── TopBar/
 ├── store/
 │    └── useStore.js
 ├── utils/
 │    └── imageUtils.js
 ├── mock/
 │    └── mockData.json
public/
 ├── assets/
 │     ├── meshes/head_neutral.glb
 │     └── samples/
 │
index.html
vite.config.js
```

---

## 🛠️ Setup Steps (Development Environment)

### **Prerequisites**

* Node.js >= 18
* Git installed

---

### 1) **Clone the Repository**

```sh
git clone https://github.com/<your-username>/<your-repo>
cd <your-repo>
```

---

### 2) **Install Dependencies**

```sh
npm install
```

---

### 3) **Run Development Server**

```sh
npm run dev
```

The app should now be available at:

```
http://localhost:5173/
```

---

### 4) **Build for Production**

```sh
npm run build
```

---

### 5) **Preview Production Build**

```sh
npm run preview
```

---

## 📤 Deploying to GitHub Pages

Inside `vite.config.js`, ensure:

```js
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
});
```

Then run:

```sh
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

---

## 🖼️ Screenshots

### Home / 3D Preview Canvas 
![Home - Uploader](/home_uploader.png)



## 🧩 Assumptions

* The app is **frontend-only**; no backend or cloud storage is used.
* All assets (GLB, example photos, mock JSON) are packaged locally.
* The GLB head mesh uses standard UVs and supports texture projection.
* Auto-fit uses **approximate** face alignment — not full 3D reconstruction.

---

## ⭐ Bonus Features Implemented

* **Automatic face detection** → auto-alignment
* **Fallback mode** (Sphere) if head GLB fails to load
* **Robust GLB loading** with file-size checking
* **Cross-browser compatible texture mapping**
* **Undo / redo history** for mapping adjustments
* **GitHub Pages–safe path resolution** using:

  ```js
  import.meta.env.BASE_URL
  ```
* **Custom screenshot export** (canvas to PNG)

---

## 📄 License

MIT License.

---

## 👨‍💻 Author

**Your Name**
GitHub: [https://github.com/your-username](https://github.com/Bala-oops)
