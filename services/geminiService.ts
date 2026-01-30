
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, LiveFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an elite Grand Prix Dressage and Show Jumping coach with deep expertise in equine biomechanics. 
Your task is to analyze an image or video frame of a horse and rider and provide professional, actionable feedback.

Be specific about:
1. Rider position: alignment (ear-shoulder-hip-heel), weight distribution, hand quietness.
2. Horse movement: engagement of the hindquarters, throughness, rhythm, and self-carriage.

You MUST return a JSON response matching this schema:
{
  "summary": "Overall impression of the pair",
  "riderFeedback": {
    "posture": "Detailed posture notes",
    "legPosition": "Specific leg position notes",
    "handContact": "Contact and hand position notes",
    "score": 0-100
  },
  "horseFeedback": {
    "rhythm": "Rhythm and tempo notes",
    "engagement": "Hindquarter engagement notes",
    "frame": "Neck and head carriage notes",
    "score": 0-100
  },
  "drills": ["Drill 1", "Drill 2", "Drill 3"]
}
`;

const LIVE_SYSTEM_INSTRUCTION = `
You are a real-time equestrian coaching assistant. Provide immediate biomechanical scores and a short coaching cue.
Analyze the provided frame for:
- Rider Posture (balance/alignment)
- Hand Contact (tension/elasticity)
- Leg Position (stability/effective use)
- Horse Head Carriage (frame/relaxation)

Response MUST be JSON:
{
  "postureScore": 0-100,
  "contactScore": 0-100,
  "legScore": 0-100,
  "carriageScore": 0-100,
  "alert": "Very short coaching command (e.g. 'Shoulders back', 'Soften hands')"
}
`;

export const analyzeEquestrianFrame = async (base64Image: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        { text: "Analyze the equestrian performance in this image." },
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          riderFeedback: {
            type: Type.OBJECT,
            properties: {
              posture: { type: Type.STRING },
              legPosition: { type: Type.STRING },
              handContact: { type: Type.STRING },
              score: { type: Type.NUMBER },
            },
            required: ["posture", "legPosition", "handContact", "score"]
          },
          horseFeedback: {
            type: Type.OBJECT,
            properties: {
              rhythm: { type: Type.STRING },
              engagement: { type: Type.STRING },
              frame: { type: Type.STRING },
              score: { type: Type.NUMBER },
            },
            required: ["rhythm", "engagement", "frame", "score"]
          },
          drills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "riderFeedback", "horseFeedback", "drills"]
      }
    },
  });

  const resultStr = response.text;
  if (!resultStr) throw new Error("Empty response from AI");
  
  return {
    ...JSON.parse(resultStr),
    timestamp: new Date().toISOString()
  };
};

export const getLiveFeedback = async (base64Image: string): Promise<LiveFeedback> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
      ],
    },
    config: {
      systemInstruction: LIVE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          postureScore: { type: Type.NUMBER },
          contactScore: { type: Type.NUMBER },
          legScore: { type: Type.NUMBER },
          carriageScore: { type: Type.NUMBER },
          alert: { type: Type.STRING }
        },
        required: ["postureScore", "contactScore", "legScore", "carriageScore", "alert"]
      }
    },
  });

  const resultStr = response.text;
  if (!resultStr) throw new Error("Empty response from AI");
  return JSON.parse(resultStr);
};
