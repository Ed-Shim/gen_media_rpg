import { create } from "zustand";

export const useStoryGenerationStore = create((set) => ({
    messages: [
        {
            role: "assistant",
            content:`
            The cabin radiates warmth and comfort, a refuge from the storm raging outside. Rain lashes against the windows, its rhythmic patter blending with the distant rumble of thunder. A crackling fireplace casts flickering shadows across rustic wooden walls lined with shelves brimming with ancient tomes and mysterious artifacts, their surfaces pulsing with an eerie luminescence.

            In the heart of this sanctuary, an elderly figure sits in a worn rocking chair, their wise eyes tracing the shifting light. Their long grey beard speaks of untold stories and guarded secrets. As you step inside, your rain-soaked cloak drips onto the wooden floor, merging with the cabin’s ambient sounds. The elder meets your gaze with a knowing smile, as if foreseeing the tale about to unfold.
            `,
        },
    ],
    narativeAudio:[{
        narrate: "https://cdn.discordapp.com/attachments/1342924886468726825/1343064794843975802/GeneratedWithElevenlabs.mp3?ex=67bbea10&is=67ba9890&hm=4b5df678a6b49915daeef9eea05081415ea2a289f50cee76549f2588b621e236&", 
        background:"https://cdn.discordapp.com/attachments/1342924886468726825/1343067287795666976/Generate_the_backgro.mp3?ex=67bbec62&is=67ba9ae2&hm=a43d349c00fb134d52601a0da9c7454f9fdf8b3cd6a7adde2ebc5684556d883c&"
    }],
    setNarrativeAudio: (audio) => set((state) => ({ narativeAudio: [...state.narativeAudio, audio] })),
    sceneImage: ["https://fal.media/files/lion/vKkEr7UdVTHCwvis81voN_7fdedecabe3647a1a78af6e1ff30de10.jpg"],
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
    - is_gender_male
    - description
    - emotional_state
    - player_impression
    - is_hostile
*/

export const useCharacterStateStore = create((set) => ({
    character: null,
    setCharacter: (character) => set({ character: character }),
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
