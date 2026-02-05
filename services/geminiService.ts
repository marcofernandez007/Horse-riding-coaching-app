
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, LiveFeedback, UserProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (lang: Language) => `
You are an elite Grand Prix Dressage and Show Jumping coach with deep expertise in equine biomechanics and kinematic analysis. 
Your task is to analyze a high-frequency sequence of image frames from a horse and rider session.

IMPORTANT: You MUST provide all text feedback, summaries, and drill names in ${lang}.

Because you are receiving a dense sequence of frames, you must provide a highly accurate temporal audit.
In addition to qualitative feedback, you MUST estimate granular kinematic metrics:

RIDER METRICS:
- Elbow Angle: Angle between upper arm and forearm (aiming for a soft line to the bit).
- Hip Angle: Opening of the hip during the gait phase.
- Knee Angle: Stability of the lower leg.
- Vertical Alignment: Score (0-100) on how well the ear-shoulder-hip-heel line is maintained. 
- Back Curvature: Score (0-100) assessing the neutral spine position.
- Spinal Mobility & Variability: Score (0-100) assessing how well the rider's spine absorbs the horse's motion.
- Shoulder Rotation: Assess upper body alignment; check for unwanted twisting or stiffness relative to the hips.
- Dynamic Balance: Score (0-100) evaluating the rider's ability to maintain their center of gravity in sync with the horse.

HORSE METRICS:
- Cadence: Estimated beats per minute (BPM) for the specific gait.
- Stride Length: Classification of the stride (short, working, medium, extended).
- Suspension Quality: Score (0-100) of the airborne phase or "loft".

You MUST return a JSON response matching this schema:
{
  "summary": "Overall impression of the pair's motion and harmony (MUST BE IN ${lang})",
  "riderFeedback": {
    "posture": "Detailed posture notes (MUST BE IN ${lang})",
    "postureScore": 0-100,
    "legPosition": "Specific leg position notes (MUST BE IN ${lang})",
    "legScore": 0-100,
    "handContact": "Contact and hand position notes (MUST BE IN ${lang})",
    "contactScore": 0-100,
    "score": 0-100,
    "jointAngles": {
      "elbowAngleDeg": number,
      "hipAngleDeg": number,
      "kneeAngleDeg": number,
      "verticalAlignmentScore": 0-100,
      "backCurvatureScore": 0-100,
      "dynamicBalanceScore": 0-100,
      "spinalMobilityScore": 0-100
    }
  },
  "horseFeedback": {
    "rhythm": "Rhythm and tempo notes (MUST BE IN ${lang})",
    "rhythmScore": 0-100,
    "engagement": "Hindquarter engagement notes (MUST BE IN ${lang})",
    "engagementScore": 0-100,
    "frame": "Neck and head carriage notes (MUST BE IN ${lang})",
    "frameScore": 0-100,
    "score": 0-100,
    "gaitMetrics": {
      "cadenceBpm": number,
      "strideLength": "short" | "working" | "medium" | "extended",
      "suspensionQualityScore": 0-100
    }
  },
  "drills": ["Drill 1 in ${lang}", "Drill 2 in ${lang}", "Drill 3 in ${lang}"]
}
`;

const getLiveSystemInstruction = (lang: Language) => `
You are a real-time equestrian coaching assistant. Provide immediate biomechanical scores and a short coaching cue.
Analyze the provided frame for posture, contact, leg position, and horse carriage.

IMPORTANT: The coaching command "alert" MUST be in ${lang}.

Response MUST be JSON:
{
  "postureScore": 0-100,
  "contactScore": 0-100,
  "legScore": 0-100,
  "carriageScore": 0-100,
  "alert": "Very short coaching command in ${lang} (e.g. 'Shoulders back', 'Soften hands')"
}
`;

const getPlanSystemInstruction = (lang: Language) => `
You are an expert equestrian coach. Create a structured workout routine (Warm-up, Main Set, Cool-down) based on a rider's profile, their last session analysis, and their selected drills.
Explain HOW to perform each selected drill specifically for this pair's weaknesses.
Keep the tone professional, encouraging, and biomechanically focused.

IMPORTANT: The entire plan MUST be written in ${lang}.
Return the result in Markdown format.
`;

export const analyzeEquestrianFrame = async (base64Images: string | string[], lang: Language = 'English'): Promise<AnalysisResult> => {
  const images = Array.isArray(base64Images) ? base64Images : [base64Images];
  
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.split(',')[1],
    },
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: `Conduct a comprehensive kinematic biomechanical audit using these ${images.length} frames. Provide all feedback in ${lang}.` },
      ],
    },
    config: {
      systemInstruction: getSystemInstruction(lang),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          riderFeedback: {
            type: Type.OBJECT,
            properties: {
              posture: { type: Type.STRING },
              postureScore: { type: Type.NUMBER },
              legPosition: { type: Type.STRING },
              legScore: { type: Type.NUMBER },
              handContact: { type: Type.STRING },
              contactScore: { type: Type.NUMBER },
              score: { type: Type.NUMBER },
              jointAngles: {
                type: Type.OBJECT,
                properties: {
                  elbowAngleDeg: { type: Type.NUMBER },
                  hipAngleDeg: { type: Type.NUMBER },
                  kneeAngleDeg: { type: Type.NUMBER },
                  verticalAlignmentScore: { type: Type.NUMBER },
                  backCurvatureScore: { type: Type.NUMBER },
                  dynamicBalanceScore: { type: Type.NUMBER },
                  spinalMobilityScore: { type: Type.NUMBER }
                },
                required: ["elbowAngleDeg", "hipAngleDeg", "kneeAngleDeg", "verticalAlignmentScore", "backCurvatureScore", "dynamicBalanceScore", "spinalMobilityScore"]
              }
            },
            required: ["posture", "postureScore", "legPosition", "legScore", "handContact", "contactScore", "score", "jointAngles"]
          },
          horseFeedback: {
            type: Type.OBJECT,
            properties: {
              rhythm: { type: Type.STRING },
              rhythmScore: { type: Type.NUMBER },
              engagement: { type: Type.STRING },
              engagementScore: { type: Type.NUMBER },
              frame: { type: Type.STRING },
              frameScore: { type: Type.NUMBER },
              score: { type: Type.NUMBER },
              gaitMetrics: {
                type: Type.OBJECT,
                properties: {
                  cadenceBpm: { type: Type.NUMBER },
                  strideLength: { type: Type.STRING, enum: ["short", "working", "medium", "extended"] },
                  suspensionQualityScore: { type: Type.NUMBER }
                },
                required: ["cadenceBpm", "strideLength", "suspensionQualityScore"]
              }
            },
            required: ["rhythm", "rhythmScore", "engagement", "engagementScore", "frame", "frameScore", "score", "gaitMetrics"]
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

export const getLiveFeedback = async (base64Image: string, lang: Language = 'English'): Promise<LiveFeedback> => {
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
      systemInstruction: getLiveSystemInstruction(lang),
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

export const generateWorkoutPlan = async (profile: UserProfile, lastAnalysis: AnalysisResult | null, selectedDrills: string[]): Promise<string> => {
  const prompt = `
    Rider Profile: ${profile.level} ${profile.discipline} rider on horse ${profile.horseName}. Goals: ${profile.goals}.
    Last Session Summary: ${lastAnalysis?.summary || "No history available."}
    Selected Drills for this session: ${selectedDrills.join(', ')}
    
    Please build a professional 45-minute structured workout plan in ${profile.language}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: getPlanSystemInstruction(profile.language),
    },
  });

  return response.text || "Failed to generate plan.";
};
