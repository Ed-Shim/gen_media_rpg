import { generateNextScene } from "@/agents/generateScene";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { messages, userMessage, lastImageUrl, scene, sceneTransitions } = body;

        if (!messages || !userMessage) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const sceneData = await generateNextScene(messages, userMessage, scene, sceneTransitions, lastImageUrl);

        return NextResponse.json(sceneData);
    } catch (error) {
        console.error("Error generating scene:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate scene" },
            { status: 500 }
        );
    }
}