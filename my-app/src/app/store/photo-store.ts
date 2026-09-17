import { create } from 'zustand';

type PhotoStore = {
  photoUri: string | null;
  setPhotoUri: (photoUri: string) => void;
};

export const usePhotoStore = create<PhotoStore>((set) => ({
  photoUri: null,
  setPhotoUri: (photoUri) => set({ photoUri }),
}));