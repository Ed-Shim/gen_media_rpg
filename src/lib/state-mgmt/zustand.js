import { create } from 'zustand'

export const useStoryGenerationStore = create((set) => ({
    messages: [
        { role: 'assistant', content: 'You find yourself standing before an imposing Victorian mansion, its windows dark and shuttered. The iron gates creak ominously in the wind.' },
    ],
    addUserMessage: (message) => set((state) => ({ 
        messages: [...state.messages, { role: 'user', content: message }]
    })),
    addAssistantMessage: (message) => set((state) => ({ 
        messages: [...state.messages, { role: 'assistant', content: message }]
    })),
    visibleIndex: 0,
    setVisibleIndex: (index) => set({ visibleIndex: index }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading: isLoading }),
}))
