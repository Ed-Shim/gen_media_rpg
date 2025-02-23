import { create } from "zustand";

export const useStoryGenerationStore = create((set) => ({
    messages: [
        {
            role: "assistant",
            content:
                "You find yourself standing before an imposing Victorian mansion, its windows dark and shuttered. The iron gates creak ominously in the wind.",
        },
    ],
    sceneImage: ["https://fal.media/files/elephant/PF-nfB4utsLyvsUNA8XQ6_ea135ba95c6049c195554f8c4a94df46.jpg"],
    addSceneImage: (image) => set((state) => ({ sceneImage: [...state.sceneImage, image] })),
    addUserMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, { role: "user", content: message }],
        })),
    addAssistantMessage: (message) =>
        set((state) => ({
            messages: [
                ...state.messages,
                { role: "assistant", content: message },
            ],
        })),
    visibleIndex: 0,
    setVisibleIndex: (index) => set({ visibleIndex: index }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading: isLoading }),
}));

/* 
    Character State Management
    Character has the following properties:
    - character_id
    - name
    - description
    - emotional_state
    - player_impression
    - is_hostile
*/

export const useCharacterStateStore = create((set) => ({
    characters: [],
    setCharacters: (characters) => set({ characters: characters }),
    addCharacter: (character) =>
        set((state) => ({ characters: [...state.characters, character] })),
    removeCharacter: (character) =>
        set((state) => ({
            characters: state.characters.filter((c) => c !== character),
        })),
    updateCharacterHostileState: (characterId, hostileState) =>
        set((state) => ({
            characters: state.characters.map((c) =>
                c.character_id === characterId
                    ? { ...c, is_hostile: hostileState }
                    : c,
            ),
        })),
    updateCharacterEmotionalState: (characterId, emotionalState) =>
        set((state) => ({
            characters: state.characters.map((c) =>
                c.character_id === characterId
                    ? { ...c, emotional_state: emotionalState }
                    : c,
            ),
        })),
    updateCharacterPlayerImpression: (characterId, playerImpression) =>
        set((state) => ({
            characters: state.characters.map((c) =>
                c.character_id === characterId
                    ? { ...c, player_impression: playerImpression }
                    : c,
            ),
        })),
}));
