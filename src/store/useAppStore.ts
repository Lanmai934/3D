import { create } from 'zustand';

interface AppState {
  // UI状态
  isLoading: boolean;
  currentPage: string;
  theme: 'dark' | 'light';
  
  // 3D场景状态
  sceneSettings: {
    enableControls: boolean;
    showEnvironment: boolean;
    autoRotate: boolean;
    animationSpeed: number;
  };
  
  // 作品集状态
  selectedProject: number | null;
  portfolioFilter: string;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  updateSceneSettings: (settings: Partial<AppState['sceneSettings']>) => void;
  setSelectedProject: (projectId: number | null) => void;
  setPortfolioFilter: (filter: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  isLoading: false,
  currentPage: '/',
  theme: 'dark',
  
  sceneSettings: {
    enableControls: true,
    showEnvironment: true,
    autoRotate: false,
    animationSpeed: 1,
  },
  
  selectedProject: null,
  portfolioFilter: 'all',
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setTheme: (theme) => set({ theme }),
  
  updateSceneSettings: (settings) => 
    set((state) => ({
      sceneSettings: { ...state.sceneSettings, ...settings }
    })),
  
  setSelectedProject: (projectId) => set({ selectedProject: projectId }),
  
  setPortfolioFilter: (filter) => set({ portfolioFilter: filter }),
}));