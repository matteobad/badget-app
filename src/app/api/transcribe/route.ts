import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";
import { HTTPException } from "hono/http-exception";
import { unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/shared/helpers/better-auth/auth";

const transcriptionRequestSchema = z.object({
  audio: z.string().describe("Base64 encoded audio data"),
  mimeType: z.string().describe("MIME type of the audio file"),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // If no session exists, return a 401 and render unauthorized.tsx
  if (!session) {
    unauthorized();
  }

  try {
    // Parse and validate the request body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();
    const validationResult = transcriptionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 },
      );
    }

    const { audio, mimeType } = validationResult.data;
    const organizationId = session.session.activeOrganizationId;
    const userId = session.user.id;

    console.info({
      msg: "Starting audio transcription",
      userId,
      organizationId,
      mimeType,
      audioLength: audio.length,
    });

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, "base64");

    // Transcribe the audio
    const result = await transcribe({
      model: openai.transcription("gpt-4o-mini-transcribe"),
      audio: audioBuffer,
    });

    console.info({
      msg: "Audio transcription completed",
      userId,
      organizationId,
      transcriptLength: result.text.length,
    });

    return NextResponse.json({
      success: true,
      text: result.text,
      language: result.language,
      durationInSeconds: result.durationInSeconds,
    });
  } catch (error) {
    console.error({
      msg: "Transcription failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof HTTPException) {
      throw error;
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to transcribe audio",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
