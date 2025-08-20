import { type CoreMessage } from "~/types/chat";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { env } from "~/env";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message } = (await req.json()) as { message: CoreMessage };

  const elevenlabs = new ElevenLabsClient({
    apiKey: env.ELEVENLABS_API_KEY,
  });

  const audio = await elevenlabs.textToSpeech.convert(env.VOICE_ID, {
    text: message.content as string,
    modelId: "eleven_flash_v2_5",
    voiceSettings: { similarityBoost: 0.5, stability: 0.55 },
  });

  return new Response(audio as never, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}