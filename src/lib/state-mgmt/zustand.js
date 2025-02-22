import { create } from 'zustand'

export const useStoryGenerationStore = create((set) => ({
  story: "",
  setStory: (newStory) => set({ story: newStory }),
}))
