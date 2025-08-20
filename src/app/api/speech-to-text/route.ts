import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { env } from "~/env";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    
    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: env.ELEVENLABS_API_KEY,
    });

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use ElevenLabs speech-to-text
    const result = await elevenlabs.speechToText.convert({
      file: buffer,
      modelId: "scribe_v1", // Model chính thức cho speech-to-text
      languageCode: "vi", // Tiếng Việt 
      diarize: true,
      tagAudioEvents: true
    });

    return Response.json({ 
      text: (result as any).text || (result as any).transcription || '',
      success: true 
    });

  } catch (error) {
    console.error("Speech-to-text error:", error);
    return Response.json({ 
      error: "Failed to convert speech to text",
      success: false 
    }, { status: 500 });
  }
}
