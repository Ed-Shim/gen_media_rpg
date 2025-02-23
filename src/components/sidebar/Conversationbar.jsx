import { Button } from "@/components/ui/button";
import { useUIStateStore, useCharacterStateStore } from "@/lib/state-mgmt/zustand";
import { useConversation } from "@11labs/react";
import { useCallback, useEffect, useRef, useMemo } from "react";

const Conversationbar = () => {
    const { setIsTextMode } = useUIStateStore();
    const activeCharacterId = useCharacterStateStore((state) => state.activeCharacterId)
    const characters = useCharacterStateStore((state) => state.characters)
    const activeCharacter = useMemo(() => {
        return characters.find((c) => c.character_id === activeCharacterId)
    }, [characters, activeCharacterId])
    const isConversationActive = useRef(false)  ;

    useEffect(() => {
        const updateConversation = async () => {
            console.log("Updating character state")
            // Use the character from props instead of getting state again
            if (!activeCharacter) return;

            try {
                // Generate first message based on character state
                const getFirstMessage = () => {
                    if (activeCharacter.is_hostile) {
                        if (activeCharacter.emotional_state.toLowerCase().includes('angry')) {
                            return "What do you want? Make it quick before I lose my patience.";
                        } else if (activeCharacter.player_impression.toLowerCase().includes('suspicious')) {
                            return "I don't trust you. State your business and be done with it.";
                        } else {
                            return "Keep your distance. Why have you come here?";
                        }
                    } else {
                        if (activeCharacter.emotional_state.toLowerCase().includes('patient')) {
                            return "Welcome, friend. How may I be of assistance today?";
                        } else if (activeCharacter.player_impression.toLowerCase().includes('welcoming')) {
                            return "Ah, a visitor! Please, come in. What brings you to my humble abode?";
                        } else {
                            return "Greetings. What matters shall we discuss?";
                        }
                    }
                };

                const body = {
                    conversation_config: {
                        agent: {
                            prompt: {
                                prompt: `You are roleplaying as ${activeCharacter.name}. Stay in character at all times.

                                Your core traits:
                                - You are ${activeCharacter.description}
                                - Your current emotional state is ${activeCharacter.emotional_state}
                                - You view the player with ${activeCharacter.player_impression}
                                - You are ${activeCharacter.is_hostile ? 'hostile and distrustful' : 'open and receptive'} in your interactions

                                Guidelines for roleplay:
                                - Always respond as your character would, based on your traits and current state
                                - Show your emotional state and attitude toward the player through your tone and word choice
                                - Be creative and detailed in your responses while staying true to your character
                                - Never break character or acknowledge that you are an AI
                                - Engage naturally in conversation as your character would
                                
                                Your goal is to have authentic interactions that reflect who your character is.`
                            },
                            first_message: getFirstMessage()
                        }
                    }
                };

                const response = await fetch(
                    `https://api.elevenlabs.io/v1/convai/agents/${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`,
                    {
                        method: "PATCH",
                        headers: {
                            "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body),
                        cache: "no-cache"
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to update agent: ${response.status}`);
                }

                const data = await response.json();
                console.log('Successfully updated conversation with character state:', data);
            } catch (error) {
                console.error('Error updating conversation:', error);
            }
        };

        updateConversation();
    }, [activeCharacter]); // Only depend on character prop

    useEffect(()=>{
        if(!isConversationActive.current){
            startConversation();
        }
    },[])

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID, // Replace with your agent ID
      });
      isConversationActive.current = true;
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    isConversationActive.current = false;
  }, [conversation]);

  return (
    <div className="w-[30%] h-full border-l border-gray-800 flex flex-col justify-end p-4">
      <Button
        variant="outline"
        className="w-full text-white border-gray-800 bg-black hover:bg-black hover:border-gray-600 hover:text-white hover:bg-gray-900"
        onClick={() => {
          stopConversation();
          setIsTextMode(true);
        }}
      >
        End Conversation
      </Button>
    </div>
  );
};

export default Conversationbar;
