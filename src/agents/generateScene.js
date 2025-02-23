import { falClient } from "@/lib/api/fal"
import elevClient from "@/lib/api/eleven"
import { SchemaType } from "@google/generative-ai";
import { characterData, storyScenes } from "@/lib/story/story-data"; //TODO: this needs to be fixed for improvements
import { gemini } from "@/lib/api/gemini";

// Helper to convert a blob to a base64 encoded data URL
const blobToBase64 = async (blob) => {
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:audio/mp3;base64,${base64}`;
};

export const generateNextScene = async (messages, userMessage, scene, sceneTransitions, lastImageUrl = null) => {
    try {
        console.log('Generating next scene...');
        // Get the last assistant message and combine with user message for context
        const lastAssistantMessage = messages.filter(msg => msg.role === 'assistant').pop();
        const userAction = `Previous scene: ${lastAssistantMessage?.content || ''}\n\nUser action: ${userMessage}`;

        // First evaluate flags to check for scene transition
        const flagEvaluation = await evaluateAllFlags(userAction, scene, sceneTransitions);
        console.log('Flag evaluation status:', {
            allSatisfied: flagEvaluation.allSatisfied,
            targetSceneId: flagEvaluation.targetSceneId,
            flags: flagEvaluation.flags
        });
        
        // Build the base prompt
        let prompt = `
            You are an AI storyteller guiding users through an interactive story.

            Current Scene Details:
            Environment: ${scene.environment}
            Character Position: ${scene.character_position}
            ${scene.character_id ? `Character Present: ${characterData.find(c => c.character_id === scene.character_id)?.description}
            Character's Emotional State: ${characterData.find(c => c.character_id === scene.character_id)?.emotional_state}` : ''}

            Here is the history of our story so far:
            ${messages.map((msg, i) => {
                if (i === 0) return `Initial Scene: ${msg.content}\n`
                return `${msg.role === 'user' ? 'User Action' : 'Scene Description'}: ${msg.content}\n`
            }).join('\n')}
        `;

        // If flags are satisfied, include transition information
        if (flagEvaluation.allSatisfied) {
            const transition = sceneTransitions.find(t => 
                t.source_scene === scene.scene_id && t.target_scene === flagEvaluation.targetSceneId
            );
            const targetScene = storyScenes.find(s => s.scene_id === flagEvaluation.targetSceneId);
            
            prompt += `
                The player's action has triggered a scene transition.
                Transition Description: ${transition.description}
                
                New Scene Environment: ${targetScene.environment}
                New Character Position: ${targetScene.character_position}

                Describe how the scene transitions based on the player's action, incorporating the transition description,
                and then establish the new scene.
            `;
        } else {
            prompt += `
                Based on this history and the user's latest input, generate the next scene of the story.
                Make it atmospheric and engaging, building on previous events.

                Focus on describing:
                - The updated details of the environment, including any changes to the surroundings.
                - The player's spatial relationship to objects and characters in the scene.
                - What the player can see, hear, smell, taste, and touch from their position.
                - Any subtle changes resulting from the player's action.
                - If a character is present, their current position and visible reactions.

                Avoid direct character dialogues.
                Keep the narrative under 3 paragraphs maximum.
                Ensure descriptions are from the player's perspective and clearly establish their position in the space.
            `;
        }

        console.log('Generating story response...');
        const storyResponse = await generateScene(prompt, userMessage);
        const storyText = storyResponse.data.output;
        console.log('Story generated:', storyText);

        console.log('Generating audio and visual media in parallel...');
        const [audioResponse, visualMedia] = await Promise.all([
            generateAudio(storyText),
            generateVisualMedia(storyText, lastImageUrl)
        ]);
        console.log('Audio and visual media generated successfully');

        console.log('Generating animated video...');
        const videoUrl = ""
        console.log('Animated video generated successfully');

        return {
            story: storyText,
            audio: audioResponse,
            imageUrl: visualMedia.imageUrl,
            videoUrl: videoUrl,
            characters: visualMedia.characters,
            activeSceneId: flagEvaluation.allSatisfied ? flagEvaluation.targetSceneId : scene.scene_id,
            updatedFlags: flagEvaluation.flags
        };

    } catch (error) {
        console.error('Error generating scene:', error);
        throw error;
    }
}

export const evaluateAllFlags = async (userMessage, scene, sceneTransitions) => {
    // Get transitions for current scene
    const transitions = sceneTransitions.filter(transition => transition.source_scene === scene.scene_id);
    
    // Get flags for all matching transitions
    const sceneFlags = transitions[0].flags;
    
    // Evaluate each flag and get updated states
    const flagEvaluations = await Promise.all(sceneFlags.map(async flag => {
        // Skip evaluation if flag is already true
        if (flag.is_true) {
            return flag;
        }
        
        const isSatisfied = await evaluateFlagScene(userMessage, flag);
        return {
            ...flag, // Include all original flag properties
            is_true: isSatisfied // Update the is_true state based on evaluation
        };
    }));

    // Check if all flags are satisfied
    const allFlagsSatisfied = flagEvaluations.every(flag => flag.is_true);

    return {
        flags: flagEvaluations, // Return flags with their updated states
        allSatisfied: allFlagsSatisfied,
        targetSceneId: allFlagsSatisfied ? transitions[0].target_scene : null
    };
}

export const evaluateFlagScene = async (userMessage, flag) => {
    try {
        console.log('Evaluating flag scene...');
        
        const schema = {
            type: SchemaType.OBJECT,
            properties: {
                flagged: {
                    type: SchemaType.BOOLEAN,
                    description: "Whether the user action matches the flag action",
                    nullable: false
                }
            },
            required: ["flagged"]
        };

        const model = gemini.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });

        const response = await model.generateContent(
            `Given this user action: "${userMessage}"
            
            And this flag action: "${flag.action}"
            
            Evaluate if the user's action matches or accomplishes the flag action.
            Return true if it does, false if it does not.`
        );

        const result = JSON.parse(response.response.text());
        console.log('Flag evaluation complete');
        return result.flagged;
    } catch (error) {
        console.error('Error evaluating flag scene:', error);
        throw error; 
    }
}

export const generateScene = async (prompt, userMessage) => {
    console.log('Calling LLM API with prompt...');
    const response = await falClient.subscribe("fal-ai/any-llm", {
        input: {
            model: "openai/gpt-4o",
            system_prompt: prompt,
            prompt: userMessage
        }
    });
    console.log('LLM response received');
    return response;
}

export const generateAudio = async (storyText) => {
    try {
      console.log("Generating narration and background audio...");
  
      // 1) Request narration & background audio in parallel
      const [narrationUrl, backgroundUrl] = await Promise.all([
        generateSpeechFileFromText(storyText),
        generateSoundEffect(storyText)
      ]);
      console.log("Audio generation complete");
      return {
        narrate: narrationUrl,
        background: backgroundUrl
      };
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
};  

export const generateSoundEffect = async (storyText) => {
    try {
        console.log('Extracting sound effect context...');
        const soundContext = await falClient.subscribe("fal-ai/any-llm", {
            input: {
                model: "openai/gpt-4o",
                system_prompt: `Extract the following elements from the story:
                - Scene setting
                - Emotional tone 
                - Key ambient sounds

                Format your response as a single concise sentence focused on atmospheric and auditory elements suitable for background sound effects.

                Do not include:
                - Character voices
                - Dialog or conversation
                - Narration elements`,
                prompt: storyText
            }
        });
        console.log('Generating sound effect...');
        const url = await generateSoundEffectFileFromText(soundContext.data.output);
        console.log('Sound effect generation complete');
        return url;
    } catch (error) {
        console.error('Error generating sound effect:', error);
        throw error;
    }
}

export const generateSpeechFileFromText = async (storyText) => {
    try {
        const reader = await elevClient.textToSpeech.convert("NOpBlnGInO9m6vDvFkFC", {
            output_format: "mp3_44100_128", 
            text: storyText,
            model_id: "eleven_multilingual_v2"
        });
        const chunks = [];
        for await (const chunk of reader) {
            chunks.push(chunk);
        }
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        // Convert blob to a Base64 data URL instead of creating a blob URL
        const dataUrl = await blobToBase64(blob);
        return dataUrl;
    } catch (error) {
        console.error("Error creating speech from text:", error);
        throw error;
    }
};

export const generateSoundEffectFileFromText = async (storyText) => {
    try {
        const reader = await elevClient.textToSoundEffects.convert({
            text: storyText,
            duration_seconds: 15
        });
        const chunks = [];
        for await (const chunk of reader) {
            chunks.push(chunk);
        }
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        // Convert blob to a Base64 data URL
        const dataUrl = await blobToBase64(blob);
        return dataUrl;
    } catch (error) {
        console.error("Error creating sound effect from text:", error);
        throw error;
    }
};

export const generateVisualMedia = async (sceneDescription, lastImageUrl = null) => {
    try {
        console.log('Starting visual media generation...');
        // First generate the image prompt
        const imagePrompt = await generateImagePrompt(sceneDescription);
        const promptText = imagePrompt.data.output;
        console.log('Image prompt generated:', promptText);
        
        // Use the generated prompt to create the next image
        const imageUrl = await generateNextSceneImageUrl(promptText, lastImageUrl);
        console.log('Image generated:', imageUrl);

        const characters = await detectCharactersInImage(imageUrl);
        
        return {
            imagePrompt: promptText,
            imageUrl: imageUrl,
            characters: characters
        };
    } catch (error) {
        console.error('Error generating visual media:', error);
        throw error;
    }
}

export const generateImagePrompt = async (sceneDescription) => {
    console.log('Generating image prompt from scene description...');
    const response = await falClient.subscribe("fal-ai/any-llm", {
        input: {
            model: "openai/gpt-4o",
            system_prompt: `You are an expert at crafting detailed image prompts for text-to-image models.

                Your task is to convert scene descriptions into comprehensive image generation prompts that capture:
                - Visual style and artistic direction
                - Character appearances, expressions and positioning 
                - Environmental details and atmosphere
                - Lighting, colors and mood
                - First-person perspective from the player's viewpoint

                Format your response as a single, detailed prompt that describes exactly how the scene should appear from the player's perspective. Focus on what they would see in front of them based on the actions and events described.

                Do not include any explanations or meta-commentary - output only the image generation prompt.`,
            prompt: sceneDescription
        }
    });
    console.log('Image prompt generation complete');
    return response;
}

export const generateNextSceneImageUrl = async (prompt, imageUrl = null) => {
    try {
        let result;
        if (imageUrl) {
            console.log('Using existing image for context:', imageUrl);
            result = await falClient.subscribe("fal-ai/flux-pro/v1.1-ultra/redux", {
                input: {
                    image_url: imageUrl,
                    prompt: prompt
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                }
            });
        } else {
            console.log('Generating new image from scratch');
            result = await falClient.subscribe("fal-ai/stable-diffusion-v35-large", {
                input: {
                    prompt,
                    aspect_ratio: "16:9",
                    image_size: "landscape_16_9",
                },
                pollInterval: 5000,
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                      update.logs.map((log) => log.message).forEach(console.log);
                    }
                },
            });
        }

        console.log('Image generation complete');
        return result.data.images[0].url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

export const generateAnimatedImageFromStaticImage = async (staticImageUrl) => {
    try {
        console.log('Starting animated image generation...');
        const result = await falClient.subscribe("fal-ai/kling-video/v1.6/standard/image-to-video", {
            input: {
                image_url: staticImageUrl,
                prompt: "Animate the image to show a dynamic scene with a sense of movement and energy.",
                aspect_ratio: "16:9",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            }
        });
        console.log('Animated image generation complete');
        return result.data.video;
    } catch (error) {
        console.error('Error generating animated image:', error);
        throw error;
    }
}

export const detectCharactersInImage = async (imageUrl) => {
    const response = await falClient.subscribe("fal-ai/florence-2-large/object-detection", {
        input: {
            image_url: imageUrl
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        }
    });

    console.log('Raw detection response:', response.data.results);
    console.log('All bounding boxes:', response.data.results.bboxes);

    const allPersonBboxes = response.data.results.bboxes.filter(bbox => bbox.label === "person" || bbox.label === "man");
    console.log('Person bounding boxes before transformation:', allPersonBboxes);

    const characters = allPersonBboxes.map((bbox) => {
        const transformed = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.w,
            height: bbox.h
        };
        return transformed;
    });

    console.log('Final characters array:', characters);
    return characters;
}