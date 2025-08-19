export interface ScoringEngine {
	computePointsForPrediction(params: {
		predictionId: string;
		isCorrect: boolean;
		confidence: number; // 0..1
	}): number;
}

export class LinearScoringV1 implements ScoringEngine {
	computePointsForPrediction({ isCorrect, confidence }: { predictionId: string; isCorrect: boolean; confidence: number; }): number {
		if (!isCorrect) return 0;
		const base = 10;
		return Math.round(base + confidence * 10);
	}
}
