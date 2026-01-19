import type { RequestEvent } from '@sveltejs/kit';
import { createServerSessionStore } from '$lib/utils/serverSessionStore';
import {
	fetchRandomWord,
	fetchSimilarityPercent,
	type SimilarityPercentResult
} from '$lib/utils/word2vec';
import { endGameSession, startGameSession } from '$lib/utils/gameSession';

type Step = {
	word: string;
	similarityToTarget: number;
	similarityFromPrevious: number | null;
	deltaToTarget: number | null;
};

type CorrelixState = {
	startWord: string;
	targetWord: string;
	path: Step[];
	active: boolean;
	minLinkSimilarity: number;
	userId?: number | null;
};

const MIN_LINK_SIMILARITY = 25;
const TARGET_SIMILARITY_MIN = 6;
const TARGET_SIMILARITY_MAX = 24;
const MAX_SELECTION_ATTEMPTS = 64;

const sessions = createServerSessionStore<CorrelixState>({
	ttlMs: 1000 * 60 * 60,
	prefix: 'correlix'
});

export async function GET({ url }: RequestEvent) {
	try {
		const rawUserId = url.searchParams.get('userId');
		const userId = rawUserId ? Number(rawUserId) : null;
		const state = await initialiseGame(userId);
		const { id: sessionId } = sessions.create(state);
		return new Response(
			JSON.stringify({
				startWord: state.startWord,
				targetWord: state.targetWord,
				path: state.path,
				minSimilarity: state.minLinkSimilarity,
				userId,
				sessionId,
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
	const { userWord, anchorWord, sessionId, userId } = await request.json();

	const entry = sessions.get(sessionId);
	if (!entry || !entry.data.active) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'no_game',
				message: 'Aucune partie active. Relancez une partie.'
			}),
			{ status: 400 }
		);
	}

	const state = entry.data;

	let anchorIndex = state.path.length - 1;
	if (anchorWord) {
		const foundIndex = state.path.findIndex((step) => step.word === anchorWord);
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

	const scopePath = state.path.slice(0, anchorIndex + 1);
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

	const anchorStep = state.path[anchorIndex];
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
	if (linkSimilarity < state.minLinkSimilarity) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'too_far',
				message: `Le mot doit être à au moins ${state.minLinkSimilarity}% du précédent (actuel: ${linkSimilarity.toFixed(1)}%).`
			}),
			{ status: 201 }
		);
	}

	const similarityToTarget = await calculateSimilarityPercent(userWord, state.targetWord);
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
	const trimmedPath = state.path.slice(0, anchorIndex + 1);
	const nextPath = [...trimmedPath, newStep];

	const isWinner = userWord === state.targetWord;
	const nextState: CorrelixState = {
		...state,
		path: nextPath,
		active: isWinner ? false : state.active
	};

	sessions.update(sessionId, nextState);

	if (isWinner) {
		const resolvedUserId = userId ?? state.userId;
		await endGameSession(resolvedUserId ?? null, 'correlix', nextPath.length - 1, true,null);
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
			path: nextPath,
			isWinner,
			anchorWord: anchorStep.word,
			message: feedback,
			sessionId
		}),
		{ status: 201 }
	);
}

async function initialiseGame(userId: number | null): Promise<CorrelixState> {
	for (let attempt = 0; attempt < MAX_SELECTION_ATTEMPTS; attempt++) {
		const candidateStart = await fetchRandomWord();
		const candidateTarget = await fetchRandomWord();

		if (candidateStart.length <= 2 || candidateTarget.length <= 2) {
			continue;
		}
		if (
			candidateStart.match(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/) ||
			candidateTarget.match(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/)
		) {
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

		if (userId) {
			await startGameSession(userId, 'correlix');
		}

		return {
			startWord: candidateStart,
			targetWord: candidateTarget,
			path: [startStep],
			active: true,
			minLinkSimilarity: MIN_LINK_SIMILARITY,
			userId
		};
	}

	throw new Error('Impossible de générer une combinaison de mots pour Correlix.');
}

async function calculateSimilarityPercent(
	word1: string,
	word2: string
): Promise<SimilarityPercentResult> {
	if (word1.toLowerCase() === word2.toLowerCase()) {
		return { status: 'ok', similarity: 100 };
	}

	return fetchSimilarityPercent(word1, word2);
}
