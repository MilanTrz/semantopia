import type { RequestEvent } from '@sveltejs/kit';

let targetWord: string = '';
let guesses: { word: string; similarity: number | false; attemptNumber: number; rank?: number }[] =
	[];
let attemptCounter = 0;
let topWords: string[] = [];

export async function POST({ request }: RequestEvent) {
	const { userGuess } = await request.json();

	try {
		if (!targetWord) {
			return new Response(JSON.stringify({ message: 'Aucune partie en cours.' }), {
				status: 400
			});
		}

		const similarity = await calculateSimilarity(userGuess.toLowerCase(), targetWord.toLowerCase());

		const isWinner = userGuess.toLowerCase() === targetWord.toLowerCase();

		let rank: number | undefined = undefined;
		if (similarity !== false && similarity !== null) {
			const guessIndex = topWords.findIndex((w) => w.toLowerCase() === userGuess.toLowerCase());
			if (guessIndex !== -1) {
				rank = guessIndex + 1;
			}
		}

		if (similarity === false) {
			return new Response(
				JSON.stringify({
					similarity: false,
					isWinner: false,
					guesses,
					notInVocabulary: true,
					message: `Le mot "${userGuess}" n'existe pas dans le vocabulaire`
				}),
				{ status: 201 }
			);
		}

		if (similarity === null) {
			return new Response(
				JSON.stringify({
					similarity: null,
					isWinner: false,
					guesses,
					error: true,
					message: 'Erreur lors du calcul de similarité'
				}),
				{ status: 201 }
			);
		}

		const existingGuess = guesses.find((g) => g.word.toLowerCase() === userGuess.toLowerCase());
		if (!existingGuess) {
			attemptCounter++;
			guesses.push({ word: userGuess, similarity, attemptNumber: attemptCounter, rank });
			guesses.sort((a, b) => {
				const aVal = typeof a.similarity === 'number' ? a.similarity : -Infinity;
				const bVal = typeof b.similarity === 'number' ? b.similarity : -Infinity;
				return bVal - aVal;
			});
		}

		return new Response(
			JSON.stringify({
				similarity,
				isWinner,
				guesses,
				targetWord: isWinner ? targetWord : undefined
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur: ' + error }), {
			status: 500
		});
	}
}

export async function GET() {
	try {
		targetWord = await getRandomWord();
		guesses = [];
		attemptCounter = 0;

		topWords = await getTopWords(targetWord, 1000);
		console.log('Top mots proches:', topWords);
		return new Response(
			JSON.stringify({
				message: 'Nouvelle partie créée',
				wordLength: targetWord.length
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur: ' + error }), {
			status: 500
		});
	}
}

async function getRandomWord(): Promise<string> {
	try {
		const response = await fetch('http://localhost:5000/api/random-word');

		if (response.ok) {
			const data = await response.json();
			console.log('Mot cible:', data.word);
			return data.word;
		}

		throw new Error('Impossible de récupérer un mot aléatoire depuis le modèle');
	} catch (error) {
		console.error('Erreur lors de la récupération du mot aléatoire:', error);
		throw error;
	}
}

async function getTopWords(word: string, topn: number = 1000): Promise<string[]> {
	try {
		const response = await fetch('http://localhost:5000/api/most-similar', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ word, topn })
		});

		if (response.ok) {
			const data = await response.json();
			return data.similar_words.map((item: { word: string }) => item.word);
		}

		console.error('Erreur lors de la récupération des mots proches');
		return [];
	} catch (error) {
		console.error('Erreur lors de la récupération des mots proches:', error);
		return [];
	}
}

async function calculateSimilarity(word1: string, word2: string): Promise<number | false> {
	if (word1 === word2) {
		return 100;
	}

	try {
		const response = await fetch('http://localhost:5000/api/similarity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ word1, word2 })
		});

		if (!response.ok) {
			throw new Error('Erreur API word2vec');
		}

		const data = await response.json();
		if (data.code === 1) {
			return false;
		} else {
			console.log(`Similarité entre "${word1}" et "${word2}":`, data.similarity);
			return data.similarity * 100;
		}
	} catch (error) {
		console.error('Erreur lors du calcul de similarité:', error);
		return 0;
	}
}
