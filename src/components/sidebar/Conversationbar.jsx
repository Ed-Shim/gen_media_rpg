import { Button } from "@/components/ui/button";
import { useUIStateStore, useCharacterStateStore } from "@/lib/state-mgmt/zustand";
import { useConversation } from "@11labs/react";
import { useCallback, useEffect, useRef, useState } from "react";

const Conversationbar = () => {
    const { setIsTextMode } = useUIStateStore();
    const activeCharacterRef = useRef(null);
    activeCharacterRef.current = useCharacterStateStore((state) => {
        const activeChar = state.characters.find((c) => c.character_id === state.activeCharacterId);
        console.log("Active character:", activeChar);
        return activeChar;
    });
    const isConversationActive = useRef(false);
    const [conversationMessages, setConversationMessages] = useState([]);

    useEffect(()=>{
        if(!isConversationActive.current){
            startConversation();
        }
    },[])

    const updateConversation = async () => {
        console.log("Updating character state on elevenlabs")
        if (!activeCharacterRef.current) return;

        try {
            // Generate first message based on character state
            const getFirstMessage = () => {
                if (activeCharacterRef.current.is_hostile) {
                    if (activeCharacterRef.current.emotional_state.toLowerCase().includes('angry')) {
                        return "What do you want? Make it quick before I lose my patience.";
                    } else if (activeCharacterRef.current.player_impression.toLowerCase().includes('suspicious')) {
                        return "I don't trust you. State your business and be done with it.";
                    } else {
                        return "Keep your distance. Why have you come here?";
                    }
                } else {
                    if (activeCharacterRef.current.emotional_state.toLowerCase().includes('patient')) {
                        return "Welcome, friend. How may I be of assistance today?";
                    } else if (activeCharacterRef.current.player_impression.toLowerCase().includes('welcoming')) {
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
                            prompt: `You are roleplaying as ${activeCharacterRef.current.name}. Stay in character at all times.

                            Your core traits:
                            - You are ${activeCharacterRef.current.description}
                            - Your current emotional state is ${activeCharacterRef.current.emotional_state}
                            - You view the player with ${activeCharacterRef.current.player_impression}
                            - You are ${activeCharacterRef.current.is_hostile ? 'hostile and distrustful' : 'open and receptive'} in your interactions

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

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => {
      console.log("Message:", message);
      setConversationMessages(prevMessages => [...prevMessages, message]);
    },
    onError: (error) => console.error("Error:", error),
    clientTools: {
        update_character:({emotional_state, player_impression, is_hostile }) =>{
            console.log("Updating local character state");
            const { activeCharacterId, updateCharacterEmotionalState, updateCharacterPlayerImpression, updateCharacterHostileState } = useCharacterStateStore.getState();

            console.log(activeCharacterId, emotional_state, player_impression, is_hostile);
            if (!activeCharacterId) return;

            try {
                if (emotional_state) {
                    updateCharacterEmotionalState(activeCharacterId, emotional_state);
                }
                if (player_impression) {
                    updateCharacterPlayerImpression(activeCharacterId, player_impression);
                }
                if (is_hostile) {
                    const isHostileBoolean = typeof is_hostile === 'string' ? 
                        is_hostile.toLowerCase() === 'true' || is_hostile.toLowerCase() === 'false' ? 
                            is_hostile.toLowerCase() === 'true' : false
                        : Boolean(is_hostile);
                    updateCharacterHostileState(activeCharacterId, isHostileBoolean);
                }
            } catch (error) {
                console.error("Error updating character state:", error);
            }
        }
    }
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
    updateConversation();
  }, [conversation]);

  return (
    <div className="w-[30%] h-full border-l border-gray-800 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4 text-xs ">
          {conversationMessages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${
                message.role === 'user' 
                  ? 'bg-gray-600 text-white rounded-lg p-3 w-[80%] ml-auto'
                  : 'text-white p-3'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-800">
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
    </div>
  );
};

export default Conversationbar;
