
export interface AnalysisResult {
  summary: string;
  riderFeedback: {
    posture: string;
    legPosition: string;
    handContact: string;
    score: number;
  };
  horseFeedback: {
    rhythm: string;
    engagement: string;
    frame: string;
    score: number;
  };
  drills: string[];
  timestamp: string;
}

export interface LiveFeedback {
  postureScore: number;
  contactScore: number;
  legScore: number;
  carriageScore: number;
  alert: string; // Short actionable feedback (max 5 words)
}

export type AppState = 'dashboard' | 'analyze' | 'history' | 'training-plan';

export interface HistoryItem {
  id: string;
  date: string;
  imageUrl: string;
  analysis: AnalysisResult;
}
