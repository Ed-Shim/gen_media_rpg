import { falClient } from "@/lib/api/fal"
import elevClient from "@/lib/api/eleven"

// Helper to convert a blob to a base64 encoded data URL
const blobToBase64 = async (blob) => {
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:audio/mp3;base64,${base64}`;
};

export const generateNextScene = async (messages, userMessage, lastImageUrl = null) => {
    try {

        // Generate story prompt and response
        const prompt = `
            You are an AI storyteller guiding users through an interactive story.
            
            Here is the history of our story so far:
            ${messages.map((msg, i) => {
                if (i === 0) return `Initial Scene: ${msg.content}\n`
                return `${msg.role === 'user' ? 'User Action' : 'Scene Description'}: ${msg.content}\n`
            }).join('\n')}

            Based on this history and the user's latest input, generate the next scene of the story.
            Make it atmospheric and engaging, building on previous events.

            Focus on describing:
            - The updated details of the environment.
            - What the player can see, hear, smell, taste, and touch.
            - Any subtle changes resulting from the player's action.

            Avoid direct character dialogues.
            Keep the narrative under 3 paragraphs maximum.
        `

        console.log('Generating story response...');
        // First generate the story response since we need it for audio and image
        const storyResponse = await generateScene(prompt, userMessage);
        const storyText = storyResponse.data.output;
        console.log('Story generated:', storyText);

        console.log('Generating audio and visual media in parallel...');
        // Generate audio and visual media in parallel since they're independent
        const [audioResponse, visualMedia] = await Promise.all([
            generateAudio(storyText), // Pass story text instead of user message
            generateVisualMedia(storyText, lastImageUrl)
        ]);
        console.log('Audio and visual media generated successfully');

        return {
            story: storyText,
            audio: audioResponse,
            imageUrl: visualMedia.imageUrl
        };

    } catch (error) {
        console.error('Error generating scene:', error);
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
                system_prompt: "Extract only the scene setting, emotional tone, and key ambient sounds from the story. Provide a single concise sentence focused on the atmospheric and auditory elements that would make good background sound effects.",
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
            text: storyText
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
        
        return {
            imagePrompt: promptText,
            imageUrl: imageUrl
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
            system_prompt: "You are an expert at generating image prompts for a text-to-image model. You will be given a scene description that will describe the story that the image should represent. Generate a detailed prompt including the style, the characters and their states, the mood, and the details of the image.",
            prompt: sceneDescription
        }
    });
    console.log('Image prompt generation complete');
    return response;
}

export const generateNextSceneImageUrl = async (prompt, imageUrl = null) => {
    try {
        console.log('Starting image generation with prompt:', prompt);
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
            result = await falClient.subscribe("fal-ai/flux-pro/new", {
                input: {
                    prompt,
                    aspect_ratio: "16:9",
                    image_size: "landscape_4_3",
                    num_inference_steps: 10,
                },
                pollInterval: 5000,
                logs: true,
                onQueueUpdate(update) {
                    console.log("queue update", update);
                }
            });
        }

        console.log('Image generation complete');
        return result.data.images[0].url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}