import OpenAI from "openai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import type { VoiceoverOptions, VoiceoverAsset } from "../../types/repurpose.js";

const execFileAsync = promisify(execFile);

const MEDIA_DIR = path.resolve("media");
const VOICEOVER_DIR = path.resolve("media/voiceover");

function ensureDirs(): void {
  for (const dir of [MEDIA_DIR, VOICEOVER_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a TTS voiceover from a script using OpenAI TTS.
 * Optionally mix it over a source video.
 */
export async function generateVoiceover(
  options: VoiceoverOptions
): Promise<VoiceoverAsset> {
  ensureDirs();

  const { contentItemId, scriptText, sourceVideoPath, voice = "nova" } = options;
  const audioPath = path.join(VOICEOVER_DIR, `${contentItemId}_voiceover.mp3`);

  // Generate TTS audio
  const openai = getOpenAI();
  const ttsResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice as any,
    input: scriptText,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await ttsResponse.arrayBuffer());
  fs.writeFileSync(audioPath, buffer);

  let videoWithVoiceoverPath: string | undefined;

  // If source video provided, mix voiceover over it
  if (sourceVideoPath && fs.existsSync(sourceVideoPath)) {
    videoWithVoiceoverPath = path.join(
      VOICEOVER_DIR,
      `${contentItemId}_with_voiceover.mp4`
    );

    await execFileAsync("ffmpeg", [
      "-y",
      "-i", sourceVideoPath,
      "-i", audioPath,
      "-filter_complex",
      "[0:a]volume=0.3[orig];[1:a]volume=1.0[vo];[orig][vo]amix=inputs=2:duration=first:dropout_transition=2[aout]",
      "-map", "0:v",
      "-map", "[aout]",
      "-c:v", "copy",
      "-preset", "fast",
      "-movflags", "+faststart",
      videoWithVoiceoverPath,
    ], { timeout: 120_000 });

    if (!fs.existsSync(videoWithVoiceoverPath)) {
      videoWithVoiceoverPath = undefined;
    }
  }

  return {
    contentItemId,
    audioPath,
    videoWithVoiceoverPath,
    fileName: `${contentItemId}_voiceover.mp3`,
  };
}
