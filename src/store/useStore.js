import create from 'zustand';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const defaultMapping = {
  scale: 1,
  rotation: 0,
  translateX: 0,
  translateY: 0,
  blend: 1,
  lighting: { intensity: 1 }
};

const STORAGE_KEY = 'avatar_mapper_v1';

export const useStore = create((set, get) => ({
  currentPhoto: null,
  mapping: { ...defaultMapping },
  undoStack: [],
  redoStack: [],
  mock: null,

  setMock: (mock) => set({ mock }),

  // set photo and persist minimal metadata
  setCurrentPhoto: (photo) =>
    set(() => {
      const newState = { currentPhoto: photo, mapping: { ...defaultMapping } };
      // persist
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.currentPhoto = { id: photo.id, src: photo.src, fileName: photo.fileName || photo.id };
        saved.mapping = newState.mapping;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
      return newState;
    }),

  setMapping: (partial, { snapshot = true } = {}) =>
    set((state) => {
      const prev = state.mapping;
      const next = { ...prev, ...partial };
      next.scale = clamp(next.scale, 0.25, 4);
      next.blend = clamp(next.blend, 0, 1);
      const undoStack = snapshot ? [...state.undoStack, prev].slice(-20) : state.undoStack;
      // persist mapping
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.mapping = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
      return { mapping: next, undoStack, redoStack: snapshot ? [] : state.redoStack };
    }),

  resetMapping: () =>
    set((state) => {
      const undoStack = [...state.undoStack, state.mapping].slice(-20);
      const next = { ...defaultMapping };
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.mapping = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
      return { mapping: next, undoStack, redoStack: [] };
    }),

  undo: () =>
    set((state) => {
      const undoStack = [...state.undoStack];
      if (!undoStack.length) return {};
      const prev = undoStack.pop();
      const redoStack = [...state.redoStack, state.mapping].slice(-20);
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.mapping = prev;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
      return { mapping: prev, undoStack, redoStack };
    }),

  redo: () =>
    set((state) => {
      const redoStack = [...state.redoStack];
      if (!redoStack.length) return {};
      const next = redoStack.pop();
      const undoStack = [...state.undoStack, state.mapping].slice(-20);
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.mapping = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
      return { mapping: next, undoStack, redoStack };
    }),

  clearHistory: () => set({ undoStack: [], redoStack: [] }),

  restoreFromStorage: () =>
    set(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved.currentPhoto) {
          return { currentPhoto: saved.currentPhoto, mapping: saved.mapping || defaultMapping };
        }
      } catch (e) {}
      return {};
    })
}));
