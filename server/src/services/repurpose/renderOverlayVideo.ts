import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import type { RenderOptions, RenderedAsset } from "../../types/repurpose.js";

const execFileAsync = promisify(execFile);

const MEDIA_DIR = path.resolve("media");
const RENDERED_DIR = path.resolve("media/rendered");

function ensureDirs(): void {
  for (const dir of [MEDIA_DIR, RENDERED_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, "\\\\\\\\")
    .replace(/'/g, "\u2019")
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function wrapText(text: string, maxCharsPerLine: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxCharsPerLine && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

/**
 * Render a repurposed video with compact text overlays using ffmpeg.
 * Uses relative font sizes scaled to video height for consistent display
 * on 9:16 Shorts (typically 1080x1920).
 */
export async function renderOverlayVideo(
  options: RenderOptions
): Promise<RenderedAsset> {
  ensureDirs();

  const { contentItemId, sourceVideoPath, hookText, headlineText, subtitleText } = options;

  if (!fs.existsSync(sourceVideoPath)) {
    throw new Error(`Source video not found: ${sourceVideoPath}`);
  }

  const outputPath = path.join(RENDERED_DIR, `${contentItemId}_repurposed.mp4`);

  const filters: string[] = [];

  if (hookText) {
    const wrapped = wrapText(hookText, 30);
    const escaped = escapeFFmpegText(wrapped);
    filters.push(
      `drawtext=text='${escaped}':fontsize=h/45:fontcolor=white:borderw=2:bordercolor=black@0.7:x=(w-text_w)/2:y=h*0.06:enable='between(t\\,0\\,3.5)'`
    );
  }

  if (headlineText) {
    const wrapped = wrapText(headlineText, 28);
    const escaped = escapeFFmpegText(wrapped);
    filters.push(
      `drawtext=text='${escaped}':fontsize=h/55:fontcolor=white:borderw=1:bordercolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2`
    );
  }

  if (subtitleText) {
    const wrapped = wrapText(subtitleText, 35);
    const escaped = escapeFFmpegText(wrapped);
    filters.push(
      `drawtext=text='${escaped}':fontsize=h/60:fontcolor=white:borderw=1:bordercolor=black@0.6:box=1:boxcolor=black@0.4:boxborderw=6:x=(w-text_w)/2:y=h*0.88`
    );
  }

  const args: string[] = ["-y", "-i", sourceVideoPath];

  if (filters.length > 0) {
    args.push("-vf", filters.join(","));
  }

  args.push(
    "-codec:a", "copy",
    "-preset", "fast",
    "-movflags", "+faststart",
    outputPath
  );

  await execFileAsync("ffmpeg", args, { timeout: 120_000 });

  if (!fs.existsSync(outputPath)) {
    throw new Error("ffmpeg render produced no output");
  }

  const stat = fs.statSync(outputPath);

  return {
    contentItemId,
    outputPath,
    fileName: `${contentItemId}_repurposed.mp4`,
    sizeBytes: stat.size,
  };
}
