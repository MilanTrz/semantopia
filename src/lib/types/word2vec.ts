export type SimilarityPercentResult =
	| { status: 'ok'; similarity: number }
	| { status: 'missing' }
	| { status: 'error' };
