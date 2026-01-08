import type { RequestEvent } from '@sveltejs/kit';
import { fetchSimilarityPercent, fetchMostSimilar } from '$lib/utils/word2vec';
import { error } from 'console';
import pool from '$lib/server/db';
import { endGameSession } from '$lib/utils/gameSession';
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


export async function GET({url}) {
	const userId = Number(url.searchParams.get('userId'));
	try {
		const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		let wordBasic:string = '';
		let wordIntruder: string = '';
		let isValid = false;
		let attempts = 0;
		const MAX_ATTEMPTS = 100; 		

		do {
			wordBasic = await randomWord();
			wordIntruder = await randomWord();
		} while ((await calculateSimilarity(wordBasic, wordIntruder)) > 20);

		let tabSimilarWord: string[] = [];

		while (!isValid && attempts < MAX_ATTEMPTS) {
			tabSimilarWord = await fetchMostSimilar(wordBasic, 2);
			isValid = checkWordsValidity(wordBasic, wordIntruder, tabSimilarWord[0], tabSimilarWord[1]);
			attempts++;
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
		const date = new Date();
		if (userId !== 0) {
			await pool.query(
				'INSERT INTO GAME_SESSION(DATE_PARTIE,EN_COURS,NOMBRE_ESSAI,TYPE,WIN,USER_ID) VALUES(?,1,0,"mimix",0,?) ',
				[date, userId]
			);
		}

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
	const normalize = (w: string): string => {
			return w
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.trim()
				.toLowerCase();
		};
	const session = activeSessions.get(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}
	try{
		const { wordIntruder, totalIntruderFound } = session;
		console.log(normalize(word),normalize(wordIntruder))
	let isWin: boolean = false;
	if (normalize(word) === normalize(wordIntruder)) {
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
		let attempts = 0;
		const MAX_ATTEMPTS = 100; 
		while (!isValid && attempts < MAX_ATTEMPTS) {
			newTabSimilarWord = await fetchMostSimilar(newWordBasic, 2);
			isValid = checkWordsValidity(
				newWordBasic,
				newWordIntruder,
				newTabSimilarWord[0],
				newTabSimilarWord[1]
			);
			attempts++;
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
	}catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
	
}

export async function PUT({ request }: RequestEvent) {
	const {idUser,nbEssai, sessionId } = await request.json();
	const session = activeSessions.get(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ message: 'Session introuvable.' }), { status: 400 });
	}
	try {
		const wordIntruder = activeSessions.get(sessionId)?.wordIntruder;
		  await endGameSession(idUser, 'mimix', nbEssai, true);
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
	console.log("similiarity ",similarityToPrevious, " entre ", wordBasic, " et ", wordCompare)
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
			.replace(/s/g, '');
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
