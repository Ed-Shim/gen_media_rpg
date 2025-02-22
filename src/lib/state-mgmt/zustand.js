import { create } from 'zustand'

export const useStoryGenerationStore = create((set) => ({
    messages: [
        { role: 'assistant', content: 'You find yourself standing before an imposing Victorian mansion, its windows dark and shuttered. The iron gates creak ominously in the wind. What would you like to do?' },
        { role: 'user', content: 'I carefully push open the front door.' },
        { role: 'assistant', content: 'The heavy wooden door groans on its hinges. Dust motes dance in the beam of moonlight that pierces the gloom of the foyer. A grand staircase curves upward to your right, while doorways to your left and right lead deeper into the darkness. The musty air carries a faint, sweet scent you can\'t quite identify.' }
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
