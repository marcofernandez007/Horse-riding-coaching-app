
export interface AnalysisResult {
  summary: string;
  riderFeedback: {
    posture: string;
    postureScore: number;
    legPosition: string;
    legScore: number;
    handContact: string;
    contactScore: number;
    score: number;
    jointAngles: {
      elbowAngleDeg: number;
      hipAngleDeg: number;
      kneeAngleDeg: number;
      verticalAlignmentScore: number;
      backCurvatureScore: number;
      dynamicBalanceScore: number;
      spinalMobilityScore: number;
    };
  };
  horseFeedback: {
    rhythm: string;
    rhythmScore: number;
    engagement: string;
    engagementScore: number;
    frame: string;
    frameScore: number;
    score: number;
    gaitMetrics: {
      cadenceBpm: number;
      strideLength: 'short' | 'working' | 'medium' | 'extended';
      suspensionQualityScore: number;
    };
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

export interface UserProfile {
  name: string;
  level: 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
  horseName: string;
  discipline: 'Dressage' | 'Show Jumping' | 'Eventing' | 'Leisure';
  goals: string;
  avatarUrl?: string;
}

export type AppState = 'dashboard' | 'analyze' | 'history' | 'training-plan' | 'settings';

export interface HistoryItem {
  id: string;
  date: string;
  imageUrl: string;
  analysis: AnalysisResult;
}
