import { create } from "zustand";
import { characterData } from "../story/story-data";

export const useStoryGenerationStore = create((set) => ({
    characterBbox: null,
    setCharacterBbox: (bbox) => set({ characterBbox: bbox }),
    messages: [
        {
            role: "assistant",
            content:`
            The study is cloaked in dim light, the air thick with the scent of old paper and burning wood. Towering bookshelves line the walls, their ancient tomes stretching beyond sight. At the room’s center, a massive oak desk is cluttered with open books and scattered papers, illuminated by the warm glow of an ornate brass lamp. To the left, a crackling fireplace casts flickering shadows, its heat a quiet contrast to the rain tapping against the tall arched window behind the desk.

            From the entrance, you take in the scene—the looming shelves, the shifting firelight, the distant rumble of the storm outside. Shadows dance across the desk, and for a moment, the room feels alive, as if the very walls are steeped in secrets waiting to be uncovered.
            `,
        },
    ],
    narativeAudio:[{
        narrate: "https://cdn.discordapp.com/attachments/1342924886468726825/1343157084014776361/ElevenLabs_2025-02-23T09_44_08_Grandpa_Spuds_Oxley_pvc_s50_sb75_se0_b_m2.mp3?ex=67bc4003&is=67baee83&hm=cc6d237a47343977f489712aa72337b1645a3f58bb752156d5acc0a974199791&", 
        background:"https://cdn.discordapp.com/attachments/1342924886468726825/1343157616607629413/A_dimly_lit_study_wi_1.mp3?ex=67bc4082&is=67baef02&hm=52cb1d760e84e294f22a3625886dae81362fbc8e26be3cef996bc8aa468afd52&"
    }],
    setNarrativeAudio: (audio) => set((state) => ({ narativeAudio: [...state.narativeAudio, audio] })),
    sceneImage: [{
        image: "https://fal.media/files/lion/orvE9a9ApQOERSZVFMQUb.jpeg", 
        video: "https://v3.fal.media/files/kangaroo/-UTgsu5nGcDTGzpdjYAC6_output.mp4"
        }],
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

export const useUIStateStore = create((set) => ({
    isTextMode: true,
    setIsTextMode: (isTextMode) => set({ isTextMode }),
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
    characters: JSON.parse(JSON.stringify(characterData)),
    activeCharacterId: null,
    setActiveCharacterId: (characterId) => set({ activeCharacterId: characterId }),
    updateCharacter: (characterId, updates) => 
        set((state) => ({
            characters: state.characters.map(char => 
                char.character_id === characterId ? { ...char, ...updates } : char
            )
        })),
    updateCharacterHostileState: (characterId, hostileState) =>
        set((state) => ({
            characters: state.characters.map(char =>
                char.character_id === characterId ? { ...char, is_hostile: hostileState } : char
            )
        })),
    updateCharacterEmotionalState: (characterId, emotionalState) =>
        set((state) => ({
            characters: state.characters.map(char =>
                char.character_id === characterId ? { ...char, emotional_state: emotionalState } : char
            )
        })),
    updateCharacterPlayerImpression: (characterId, playerImpression) =>
        set((state) => ({
            characters: state.characters.map(char =>
                char.character_id === characterId ? { ...char, player_impression: playerImpression } : char
            )
        }))
}));
