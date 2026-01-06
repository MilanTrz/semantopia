import type { RequestEvent } from '@sveltejs/kit';
import { fetchSimilarityPercent, fetchMostSimilar } from '$lib/utils/word2vec';
import { error } from 'console';
const activeSessions: Map<
	string,
	{
		wordIntruder: string;
		wordBasic: string;
		wordCloseOne: string;
		wordCloseTwo: string;
		totalIntruderFound: number;
	}
> = new Map();

export async function GET() {
	//const userId = Number(url.searchParams.get('userId'));
	try {
		const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const wordBasic: string = await randomWord();
		let wordIntruder: string = '';
		let isValid = false;
		do {
			wordIntruder = await randomWord();
		} while ((await calculateSimilarity(wordBasic, wordIntruder)) > 20);

		let tabSimilarWord: string[] = [];

		while (!isValid) {
			tabSimilarWord = await fetchMostSimilar(wordBasic, 2);
			isValid = checkWordsValidity(wordBasic, wordIntruder, tabSimilarWord[0], tabSimilarWord[1]);
		}

		activeSessions.set(sessionId, {
			wordBasic: wordBasic,
			wordIntruder: wordIntruder,
			wordCloseOne: tabSimilarWord[0],
			wordCloseTwo: tabSimilarWord[1],
			totalIntruderFound: 0
		});

		const tabShuffleWord: string[] = shuffleArray([
			wordBasic,
			wordIntruder,
			tabSimilarWord[0],
			tabSimilarWord[1]
		]);

		return new Response(JSON.stringify({ tabShuffleWord, sessionId }), {
			status: 200
		});
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
export async function POST({ request }: RequestEvent) {
	const { word, sessionId } = await request.json();
	const session = activeSessions.get(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}
	const { wordIntruder, totalIntruderFound } = session;
	let isWin: boolean = false;
	if (word == wordIntruder) {
		isWin = true;
		const newWordBasic: string = await randomWord();
		let newWordIntruder: string = '';
		let isValid = false;
		do {
			newWordIntruder = await randomWord();
		} while (
			(await calculateSimilarity(newWordBasic, newWordIntruder)) >
			Math.max(20 + totalIntruderFound, 80)
		);
		let newTabSimilarWord: string[] = [];
		while (!isValid) {
			newTabSimilarWord = await fetchMostSimilar(newWordBasic, 2);
			isValid = checkWordsValidity(newWordBasic, wordIntruder, newTabSimilarWord[0], newTabSimilarWord[1]);
		}
		activeSessions.set(sessionId, {
			wordBasic: newWordBasic,
			wordIntruder: newWordIntruder,
			wordCloseOne: newTabSimilarWord[0],
			wordCloseTwo: newTabSimilarWord[1],
			totalIntruderFound: totalIntruderFound + 1
		});

		const newTabShuffleWord: string[] = shuffleArray([
			newWordBasic,
			newWordIntruder,
			newTabSimilarWord[0],
			newTabSimilarWord[1]
		]);

		return new Response(JSON.stringify({ newTabShuffleWord, isWin }), {
			status: 200
		});
	}
	return new Response(JSON.stringify({ message: 'Ce n est pas le bon mot', isWin }), {
		status: 200
	});
}

export async function PUT({ request }: RequestEvent) {
	const { sessionId } = await request.json();
	const session = activeSessions.get(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}
	try {
		const wordIntruder = activeSessions.get(sessionId)?.wordIntruder;
		return new Response(JSON.stringify({ wordIntruder }), {
			status: 200
		});
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

async function randomWord() {
	const response = await fetch('http://localhost:5000/api/random-word', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});
	const data = await response.json();
	const wordToFind: string = data.word;
	if (
		wordToFind.length < 3 ||
		wordToFind.match(/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/)
	) {
		return randomWord();
	}
	return wordToFind;
}

async function calculateSimilarity(wordBasic: string, wordCompare: string) {
	const similarityToPrevious = await fetchSimilarityPercent(wordBasic, wordCompare);
	if (similarityToPrevious.status === 'missing') {
		throw error("le mot n'existe pas");
	}

	if (similarityToPrevious.status === 'error') {
		throw error('erreur dans la comparaison');
	}

	return similarityToPrevious.similarity;
}
function shuffleArray(arr: string[]): string[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
function checkWordsValidity(
	wordBasic: string,
	wordIntruder: string,
	word1: string,
	word2: string
): boolean {
	const normalize = (word: string): string => {
		return word
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim()
			.toLowerCase()
			.replace(/s/,'')
	};

	if (!word1 || !word2 || word1.length === 0 || word2.length === 0) {
		return false;
	}
	if (normalize(word1) === normalize(word2)) {
		return false;
	}

	if (normalize(word1) === normalize(wordBasic) || normalize(word2) === normalize(wordBasic)) {
		return false;
	}

	if (
		normalize(word1) === normalize(wordIntruder) ||
		normalize(word2) === normalize(wordIntruder)
	) {
		return false;
	}

	return true;
}
