export const storyScenes = [
    {
        scene_id: 1,
        environment: "A dimly lit study filled with towering bookshelves that line the walls from floor to ceiling. Ancient leather-bound tomes and scrolls are meticulously organized on dark wooden shelves. A massive oak desk dominates the center of the room, its surface cluttered with open books, scattered papers, and an ornate brass lamp casting a warm glow. Behind the desk, a tall arched window reveals a stormy night sky, with rain pattering against the glass. To the left, a crackling fireplace provides additional warmth and atmospheric lighting.",
        character_id: null,
        character_position: "You stand just inside the study's entrance, about fifteen feet from the central desk. From this position, you have a clear view of the entire room. The desk and window are directly ahead, while the crackling fireplace is visible to your left. The bookshelves tower over you on all sides, their contents easily readable on the lower shelves but becoming harder to discern near the ceiling. The brass lamp's glow creates long shadows that dance across the scattered papers on the desk's surface."
    },
    {
        scene_id: 2,
        environment: "A mysterious alchemy laboratory with stone walls covered in phosphorescent moss. Wooden tables line the perimeter, holding bubbling potions in glass vials and mysterious apparatus. Shelves above display jars of preserved specimens and magical ingredients. A large copper cauldron sits in the center, emitting a faint blue glow. The air is thick with aromatic steam and dancing motes of magical energy. The elderly alchemist gestures to an empty workstation, where ingredients and instructions for a complex potion are laid out.",
        character_id: "alchemist_01",
        character_position: "You've descended the stone staircase and stand at the laboratory's entrance. The elderly alchemist is positioned twenty feet away, behind the glowing cauldron at the room's center. From your vantage point, you can clearly see all the workstations along the walls, though the specimens in the higher shelves are partially obscured by the drifting magical steam. The empty workstation the alchemist gestures to is about ten feet to your right, its surface clearly visible and accessible."
    },
    {
        scene_id: 3,
        environment: "An opulent dining hall with a vaulted ceiling supported by marble columns. A long mahogany table stretches down the center, set with fine silver and crystal. Ornate tapestries depicting mythical scenes adorn the walls between tall windows. Crystal chandeliers cast rainbow-like reflections across the polished floor. At the far end, a grand fireplace houses a roaring fire, its mantle decorated with intricate carvings.",
        character_id: "noble_01",
        character_position: "You stand at the dining hall's entrance, with the full grandeur of the forty-foot-long room before you. The noble sits at the far end of the table, his figure partially silhouetted by the fireplace behind him. From your position, you can see the entire length of the mahogany table, though the place settings at the far end are harder to distinguish in detail. The tapestries and windows line both walls within your peripheral vision, while the chandeliers hang at regular intervals overhead, casting their prismatic light across the scene."
    }
]

export const sceneTransitions = [
    {
        source_scene: 1,
        target_scene: 2,
        is_ending: false,
        flags: [
            {
                flag_id: "examine_desk",
                action: "Carefully examine the ancient texts and papers scattered across the oak desk",
                is_true: false,
                is_permanent: true
            }
        ],
        description: "As you examine the ancient texts scattered across the desk, you discover a hidden door behind one of the bookshelves. It creaks open to reveal a winding stone staircase descending into a mysterious laboratory below."
    },
    {
        source_scene: 2,
        target_scene: 3,
        is_ending: true,
        flags: [
            {
                flag_id: "mix_potion",
                action: "Follow the alchemist's instructions to mix a mysterious potion",
                is_true: false,
                is_permanent: true
            }
        ],
        description: "The successful completion of the potion causes the laboratory to fill with a brilliant golden light. As the light fades, you find yourself transported to an opulent dining hall. The elderly alchemist's form shimmers and transforms, revealing her true identity as the long-lost Queen of the Realm. She smiles warmly, ready to share the truth about your own mysterious heritage and destiny."
    }
]

export const characterData = [
    {
        character_id: "alchemist_01",
        name: "Eldred the Alchemist",
        is_gender_male: false,
        description: "An elderly alchemist with a kind face and a gentle demeanor. Her silver hair is neatly tucked beneath a wide-brimmed hat adorned with mystical symbols. She wears an intricately embroidered robe in deep purple, its sleeves stained with various alchemical substances. Her eyes hold both wisdom and curiosity as she guides visitors through her mysterious craft.",
        emotional_state: "Patient and intrigued",
        player_impression: "Neutral but welcoming",
        is_hostile: false
    }
]