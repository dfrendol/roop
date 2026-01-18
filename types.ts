
export interface StartupFailure {
  id: string;
  name: string;
  industry: string;
  founded: number;
  defunct: number;
  valuationAtPeak: string;
  reasonForFailure: string;
  description: string;
  image: string;
  solutions: Solution[];
  aiAnalysis?: AIAnalysis;
}

export interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  replies: Reply[]; // Recursive replies
}

export interface Solution {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  aiScore: number;
  aiFeedback: string;
  likes: number;
  dislikes: number;
  replies: Reply[];
}

export interface AIAnalysis {
  rootCause: string;
  hiddenOpportunities: string[];
  suggestedPivot: string;
  viabilityScore: number;
  story: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
