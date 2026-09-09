import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";

const PORT = 3000;

// In-memory audio cache for instant playback
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Human Voice TTS Endpoint using Gemini Flash TTS
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, lang = "en", voice = "Kore", emotion = "warm and friendly shopkeeper" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const cacheKey = `${lang}_${voice}_${text.trim()}`;
      if (audioCache.has(cacheKey)) {
        const cached = audioCache.get(cacheKey)!;
        return res.json({
          audio: cached.audioBase64,
          mimeType: cached.mimeType,
          cached: true,
        });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is not configured on server",
          fallback: true,
        });
      }

      // Voice mapping for ultra-natural human tone
      // Supported prebuilt Gemini TTS voices:
      // Female: 'Kore' (warm natural female), 'Zephyr' (calm gentle female), 'Aoede' (melodic female)
      // Male: 'Puck' (cheerful energetic male), 'Fenrir' (confident narrator), 'Charon' (articulate professional)
      const validVoices = ["Kore", "Zephyr", "Aoede", "Puck", "Fenrir", "Charon"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";
      const isFemale = ["Kore", "Zephyr", "Aoede"].includes(selectedVoice);

      // Formulate clear, natural speech prompt for multilingual TTS
      let speechPrompt = text;
      if (lang === "as") {
        speechPrompt = `Please read this Assamese text aloud in a warm, natural, friendly female voice with clear native Assamese pronunciation: ${text}`;
      } else if (lang === "bn") {
        speechPrompt = `Please read this Bengali text aloud in a warm, natural, friendly female voice with clear native Bengali pronunciation: ${text}`;
      } else if (lang === "hi") {
        speechPrompt = `Please read this Hindi text aloud in a warm, natural, friendly female voice with clear native Hindi pronunciation: ${text}`;
      } else {
        speechPrompt = `Please read this text aloud in a warm, natural female voice: ${text}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: speechPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const audioBase64 =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioBase64) {
        return res.status(500).json({ error: "Failed to synthesize speech audio" });
      }

      const mimeType = "audio/pcm;rate=24000";
      audioCache.set(cacheKey, { audioBase64, mimeType });

      return res.json({
        audio: audioBase64,
        mimeType,
        cached: false,
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuota = errMsg.includes("429") || errMsg.includes("Quota exceeded") || errMsg.includes("RESOURCE_EXHAUSTED");
      
      if (isQuota) {
        console.warn("TTS Quota limit reached on Gemini 3.1 Flash TTS. Client will seamlessly use local browser speech engine.");
      } else {
        console.warn("TTS generation notice:", errMsg);
      }

      return res.status(200).json({
        fallback: true,
        quotaExceeded: isQuota,
        error: isQuota
          ? "Gemini Flash TTS daily free tier rate limit reached. Auto-switching to high-quality local speech engine."
          : errMsg,
      });
    }
  });

  // Vite development middleware vs production static handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hisab Kitap Server running on http://localhost:${PORT}`);
  });
}

startServer();
