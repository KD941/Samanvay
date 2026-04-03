import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  // default: dark (fits the futuristic/tech vibe)
  return 'dark';
}

function applyThemeToDom(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
}

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  setMode: (mode) => {
    localStorage.setItem('theme', mode);
    applyThemeToDom(mode);
    set({ mode });
  },
  toggle: () => {
    const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    get().setMode(next);
  },
  init: () => {
    const mode = getInitialTheme();
    applyThemeToDom(mode);
    set({ mode });
  },
}));
