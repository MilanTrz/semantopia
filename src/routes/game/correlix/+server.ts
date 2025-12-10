import type { RequestEvent } from '@sveltejs/kit';

type Step = {
	word: string;
	similarityToTarget: number;
	similarityFromPrevious: number | null;
	deltaToTarget: number | null;
};

const MIN_LINK_SIMILARITY = 25;
const TARGET_SIMILARITY_MIN = 6;
const TARGET_SIMILARITY_MAX = 24;
const MAX_SELECTION_ATTEMPTS = 64;

let gameState: {
	startWord: string;
	targetWord: string;
	path: Step[];
	active: boolean;
	minLinkSimilarity: number;
} = {
	startWord: '',
	targetWord: '',
	path: [],
	active: false,
	minLinkSimilarity: MIN_LINK_SIMILARITY
};

export async function GET() {
	try {
		await initialiseGame();
		return new Response(
			JSON.stringify({
				startWord: gameState.startWord,
				targetWord: gameState.targetWord,
				path: gameState.path,
				minSimilarity: gameState.minLinkSimilarity,
				message: "Construisez un pont lexical du mot de départ vers le mot d'arrivée."
			}),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Erreur Correlix GET:', error);
		return new Response(
			JSON.stringify({ message: 'Erreur serveur lors de la création de la partie.' }),
			{ status: 500 }
		);
	}
}

export async function POST({ request }: RequestEvent) {
	const { userWord, anchorWord } = await request.json();

	if (!gameState.active) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'no_game',
				message: 'Aucune partie active. Relancez une partie.'
			}),
			{ status: 400 }
		);
	}

	let anchorIndex = gameState.path.length - 1;
	if (anchorWord) {
		const foundIndex = gameState.path.findIndex((step) => step.word === anchorWord);
		if (foundIndex !== -1) {
			anchorIndex = foundIndex;
		}
	}

	if (anchorIndex < 0) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'no_context',
				message: "Impossible d'identifier l'étape de référence."
			}),
			{ status: 400 }
		);
	}

	const scopePath = gameState.path.slice(0, anchorIndex + 1);
	const alreadyUsed = scopePath.some((step) => step.word === userWord);
	if (alreadyUsed) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'duplicate',
				message: 'Vous avez déjà utilisé ce mot.'
			}),
			{ status: 201 }
		);
	}

	const anchorStep = gameState.path[anchorIndex];
	if (!anchorStep) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'no_context',
				message: "Impossible de retrouver l'historique de la partie."
			}),
			{ status: 500 }
		);
	}

	const similarityToPrevious = await calculateSimilarityPercent(anchorStep.word, userWord);
	if (similarityToPrevious.status === 'missing') {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'unknown_word',
				message: "Le mot proposé n'est pas reconnu."
			}),
			{ status: 201 }
		);
	}

	if (similarityToPrevious.status === 'error') {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'api_error',
				message: 'Impossible de vérifier la proximité avec le mot précédent.'
			}),
			{ status: 500 }
		);
	}

	const linkSimilarity = similarityToPrevious.similarity;
	if (linkSimilarity < gameState.minLinkSimilarity) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'too_far',
				message: `Le mot doit être à au moins ${gameState.minLinkSimilarity}% du précédent (actuel: ${linkSimilarity.toFixed(1)}%).`
			}),
			{ status: 201 }
		);
	}

	const similarityToTarget = await calculateSimilarityPercent(userWord, gameState.targetWord);
	if (similarityToTarget.status === 'missing') {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'unknown_word',
				message: "Le mot proposé n'est pas reconnu."
			}),
			{ status: 201 }
		);
	}

	if (similarityToTarget.status === 'error') {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'api_error',
				message: 'Impossible de calculer la proximité avec le mot objectif.'
			}),
			{ status: 500 }
		);
	}

	const closeness = similarityToTarget.similarity;
	const delta = closeness - anchorStep.similarityToTarget;

	const newStep: Step = {
		word: userWord,
		similarityToTarget: closeness,
		similarityFromPrevious: linkSimilarity,
		deltaToTarget: delta
	};
	const trimmedPath = gameState.path.slice(0, anchorIndex + 1);
	gameState.path = [...trimmedPath, newStep];

	const isWinner = userWord === gameState.targetWord;
	if (isWinner) {
		gameState.active = false;
	}

	let feedback: string;
	if (isWinner) {
		feedback = 'Pont complet ! Vous avez atteint le mot objectif.';
	} else if (delta > 0) {
		feedback = `+${delta.toFixed(1)} pts vers le mot objectif (${closeness.toFixed(1)}%).`;
	} else if (delta < 0) {
		feedback = `${delta.toFixed(1)} pts : vous reculez, mais le pont reste valide.`;
	} else {
		feedback = `Statu quo : ${closeness.toFixed(1)}% de proximité.`;
	}

	return new Response(
		JSON.stringify({
			success: true,
			path: gameState.path,
			isWinner,
			anchorWord: anchorStep.word,
			message: feedback
		}),
		{ status: 201 }
	);
}

async function initialiseGame() {
	for (let attempt = 0; attempt < MAX_SELECTION_ATTEMPTS; attempt++) {
		const candidateStart = await getRandomWord();
		const candidateTarget = await getRandomWord();

		if (candidateStart.length <=2 || candidateTarget.length <=2){
			continue;
		}
		if (candidateStart.match(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/) || candidateTarget.match(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/)){
			continue;
		}

		if (!candidateStart || !candidateTarget) {
			continue;
		}

		if (candidateStart === candidateTarget) {
			continue;
		}

		const similarityCheck = await calculateSimilarityPercent(candidateStart, candidateTarget);
		if (similarityCheck.status !== 'ok') {
			continue;
		}

		const closeness = similarityCheck.similarity;
		if (closeness < TARGET_SIMILARITY_MIN || closeness > TARGET_SIMILARITY_MAX) {
			continue;
		}

		const startStep: Step = {
			word: candidateStart,
			similarityToTarget: closeness,
			similarityFromPrevious: null,
			deltaToTarget: null
		};

		gameState = {
			startWord: candidateStart,
			targetWord: candidateTarget,
			path: [startStep],
			active: true,
			minLinkSimilarity: MIN_LINK_SIMILARITY
		};

		return;
	}

	throw new Error('Impossible de générer une combinaison de mots pour Correlix.');
}

async function getRandomWord(): Promise<string> {
	const response = await fetch('http://localhost:5000/api/random-word');
	if (!response.ok) {
		throw new Error("Échec lors de la récupération d'un mot aléatoire");
	}
	const data = await response.json();
	const cleaned = data.word;
	if (!cleaned) {
		throw new Error('Mot aléatoire invalide');
	}
	return cleaned;
}

async function calculateSimilarityPercent(
	word1: string,
	word2: string
): Promise<
	| {
			status: 'ok';
			similarity: number;
	  }
	| {
			status: 'missing';
	  }
	| {
			status: 'error';
	  }
> {
	try {
		const response = await fetch('http://localhost:5000/api/similarity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ word1, word2 })
		});

		if (!response.ok) {
			return { status: 'error' };
		}

		const data = await response.json();

		if (data.code === 1) {
			return { status: 'missing' };
		}

		if (typeof data.similarity !== 'number') {
			return { status: 'error' };
		}

		return { status: 'ok', similarity: data.similarity * 100 };
	} catch (error) {
		console.error('Erreur similarite Correlix:', error);
		return { status: 'error' };
	}
}
