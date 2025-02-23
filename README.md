## Inspiration
The primary consumer challenge is loneliness and boredom, which we believe will worsen with increased technology and AI adoption. We see potential in TTRPGs (e.g., DnD, CoC) as they enable social gaming without requiring prior skills. However, TTRPGs remain a niche market, primarily community-driven and in-person. Early AI-powered digital adaptations exist but are largely text-based and lack engagement. We wanted to experiment with advanced audio models, enhanced by image, video, and LLMs, to create a more immersive and engaging generative roleplay experience. 

## What it does
- A storytelling game powered by audio and media, featuring narration, background music, and animated visuals. Users make decisions and talk with characters in real time.
- Each scene and character state is tracked, ensuring actions have consequences.
- The story follows a predefined backbone for guidance but allows full user decision-making.
- AI agents handle storytelling, state management, and character responses.

## How we built it
- Frontend built using Next.js App Router, with ElevenLabs for sound effects, narration, and real-time conversation. Use Fal.ai for image generation, LLM, and image-to-video animation.
- The AI agent works as follows
++ [Story Agent] The AI generates the next story scene using an LLM via Fal.ai, analyzing user input enriched with environmental details, character emotions, and story history to create an immersive, interactive narrative.
++ [Story Agent] Each response evaluates whether the scene should transition by checking the flags of the current scene; if triggered, the system updates the environment (e.g., changing the room the player is in).
++ [Immersive Experience Agent] ElevenLabs' text-to-speech and text-to-sound-effect models convert the generated scene into high-quality narrated audio with background sounds and music.
++ [Immersive Experience Agent] Models like Stable Diffusion XL, Flux-Pro, and Kling-Video via Fal.ai generate scene images and animate static visuals for a more dynamic experience.
++ [Immersive Experience Agent] Florence-2 Large performs object detection, identifying character locations so users can interact by simply clicking on them.
++ [Frontend Conversation Agent] ElevenLabs' conversation agent manages character states (e.g., emotion, hostility) and enables real-time player interactions.

## Challenges we ran into
- Ensuring image consistency across scenes was difficult, even with ControlNet or reference images. We explored video models like Ray2 for stability but lacked time for implementation.
- Synchronizing local state with ElevenLabs’ conversational tone required optimization to stabilize tool calls.

## Accomplishments that we're proud of
Created an immersive experience with audio-driven narration and real-time conversation, making it feel like a real game rather than just AI-generated text and images. Built everything in 24 hours with a two-person team formed on Saturday.

## What we learned
Implementing ElevenLabs’ conversational AI was easier than expected, with broad applicability across use cases. Text-to-sound effects were flexible and pretty accurate with the instruction, enhancing UX with well-matched background music and immersive sound design.

## What's next for Story of Ooo
- Develop multiplayer functionality.
- Build a marketplace for user-created stories/campaigns.
- Design more complex stories for testing and demonstration.
- Enhance the storytelling agent with better frameworks, role separation, and expanded state tracking.
- Improve image-to-video and text-to-video rendering speed and implement it.
- Generate character portraits with lip sync for more realistic conversations.