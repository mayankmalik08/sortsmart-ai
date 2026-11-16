import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { validateWasteClassification } from './src/utils/wasteLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function getConfiguredApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key;
}

const SYSTEM_INSTRUCTION = `You are SortSmart AI, an accurate waste segregation assistant built for Indian college campuses, hostels, offices, and municipalities.
Analyze the provided image carefully and honestly:
1. Identify the visible waste item(s) specifically based ONLY on what is in the image.
2. Classify it into exactly one of:
   - "Wet waste" (biodegradable kitchen/food scraps, fruit peels, tea leaves, garden waste)
   - "Dry waste" (soiled paper, multi-layer wrappers/chips packets, non-recyclable packaging, thermocol, tissues)
   - "Recyclable waste" (clean PET plastic bottles, aluminum cans, clean cardboard, glass bottles, newspapers, clean HDPE containers)
   - "E-waste" (batteries, chargers, cables, circuit boards, earphones, bulbs/LEDs, old phones/electronics)
   - "Hazardous waste" (medical/biomedical items, expired medicines, syringes, paint/solvent tins, chemical cleaners, broken glass/sharps wrapped safely)
   - "Unclear" (if the image is blurry, dark, obstructed, contains no clear waste item, or cannot be reliably classified)
3. Explain clearly why it belongs to that category.
4. Provide practical disposal instructions suited to Indian campus & municipal 2-bin/3-bin/e-waste collection systems.
5. Set specialHandlingRequired=true and provide specialHandlingNote when items need rinsing, battery terminal taping, puncture-proof wrapping, or separate e-waste/hazardous drop-off.
6. Only include a numeric confidence (1-100) when the item is clearly visible; if unclear, set isUnclear=true, category="Unclear", and omit or set confidence=0.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    const apiKey = getConfiguredApiKey();
    res.json({
      ok: true,
      geminiConfigured: Boolean(apiKey),
      model: 'gemini-4-hydrogen',
    });
  });

  app.post('/api/analyze-waste', async (req, res) => {
    const apiKey = getConfiguredApiKey();
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY_UNCONFIGURED',
        message:
          'Live Gemini API credentials are not configured on the server. Use Clearly Labelled Demo Mode to test sample classifications.',
      });
      return;
    }

    const { imageBase64, mimeType } = req.body ?? {};

    if (typeof imageBase64 !== 'string' || imageBase64.trim().length < 32) {
      res.status(400).json({
        error: 'INVALID_IMAGE',
        message: 'Please provide a valid waste image before running analysis.',
      });
      return;
    }

    const normalizedMime =
      typeof mimeType === 'string' ? mimeType.toLowerCase().trim() : 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      res.status(400).json({
        error: 'UNSUPPORTED_IMAGE_TYPE',
        message: `Unsupported image format (${normalizedMime}). Please upload a JPEG, PNG, or WebP photo.`,
      });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: normalizedMime === 'image/jpg' ? 'image/jpeg' : normalizedMime,
                data: cleanBase64,
              },
            },
            {
              text: 'Identify the waste item in this image and return its structured waste segregation classification.',
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              item: {
                type: Type.STRING,
                description: 'Specific waste item visible in the image.',
              },
              category: {
                type: Type.STRING,
                description:
                  'One of: Wet waste, Dry waste, Recyclable waste, E-waste, Hazardous waste, or Unclear.',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Concise explanation of why the item belongs in this category.',
              },
              recommendedBin: {
                type: Type.STRING,
                description: 'Recommended bin or campus collection point.',
              },
              instructions: {
                type: Type.STRING,
                description: 'Actionable preparation and disposal instructions.',
              },
              specialHandlingRequired: {
                type: Type.BOOLEAN,
                description: 'True if rinsing, wrapping, battery taping, or isolated drop-off is needed.',
              },
              specialHandlingNote: {
                type: Type.STRING,
                description: 'Specific safety or prep precaution if specialHandlingRequired is true.',
              },
              ecoTip: {
                type: Type.STRING,
                description: 'Short practical sustainability tip related to this item.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Confidence percentage 1-100 only when item is clearly identifiable; 0 if unclear.',
              },
              isUnclear: {
                type: Type.BOOLEAN,
                description: 'True when the image is too blurry, dark, or ambiguous to classify reliably.',
              },
            },
            required: [
              'item',
              'category',
              'reasoning',
              'recommendedBin',
              'instructions',
              'specialHandlingRequired',
              'ecoTip',
              'isUnclear',
            ],
          },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({
          error: 'EMPTY_AI_RESPONSE',
          message: 'Gemini returned an empty response. Please retry with a clearer photo.',
        });
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({
          error: 'INVALID_AI_JSON',
          message: 'AI returned an unreadable format. Please retry scanning.',
        });
        return;
      }

      const validated = validateWasteClassification(parsed);
      if (!validated.valid) {
        res.status(502).json({
          error: 'INVALID_CLASSIFICATION_PAYLOAD',
          message: validated.error,
        });
        return;
      }

      res.json({
        mode: 'live',
        result: validated.data,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[SortSmart AI] /api/analyze-waste error:', errMsg);

      if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
        res.status(401).json({
          error: 'GEMINI_AUTH_ERROR',
          message: 'Gemini API authentication failed. Please check the configured GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'GEMINI_QUOTA_EXCEEDED',
          message: 'AI service rate limit reached. Please wait a moment and try again.',
        });
        return;
      }

      res.status(500).json({
        error: 'GEMINI_REQUEST_FAILED',
        message: 'Unable to analyze the image right now. You can retry or select the category manually.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SortSmart AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
