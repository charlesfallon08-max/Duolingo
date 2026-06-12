import type { VercelRequest, VercelResponse } from "@vercel/node";

const VOICE_ID = "tomkxGQGz4b1kE0EM722";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "not configured" });

  const { text, slow } = req.body as { text: string; slow?: boolean };
  if (!text) return res.status(400).json({ error: "missing text" });

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: slow ? 0.7 : 1.0,
        },
      }),
    }
  );

  if (!r.ok) return res.status(r.status).json({ error: "ElevenLabs error" });

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  const buf = await r.arrayBuffer();
  res.send(Buffer.from(buf));
}
