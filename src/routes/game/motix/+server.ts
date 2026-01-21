import type { RequestEvent } from '@sveltejs/kit';
import { endGameSession, startGameSession } from '$lib/utils/gameSession';

export async function POST({ request }: RequestEvent) {
	const { sizeWord, userId } = await request.json();
	try {
		const data = await getRandomWord(sizeWord);
		const findWord = data.name;
		const findCategorie = data.categorie;
		const similarWord = await getSimilarWord(findWord);
	
		const tabWord = findWord
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.split('');
		await startGameSession(userId, 'motix');

		return new Response(
			JSON.stringify({
				tabWord,
				findCategorie,
				similarWord
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

export async function PUT({ request }: RequestEvent) {
	const { nbEssai, isVictory, idUser } = await request.json();
	try {
		await endGameSession(idUser, 'motix', nbEssai, Boolean(isVictory), null);
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Erreur Server:', error);
		throw error;
	}
}

async function getRandomWord(sizeWord: number): Promise<{ name: string; categorie: string }> {
	const response = await fetch('https://trouve-mot.fr/api/size/' + sizeWord);
	if (!response.ok) {
		throw new Error('Erreur lors de la récupération du mot');
	}
	const data = await response.json();
	return data[0];
}
async function getSimilarWord(word: string) {
	const normWord = normalize(word);
	const response = await fetch('http://localhost:5000/api/most-similar', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			word: word,
			topn: 100
		})
	});
	const data = await response.json();
	for (const item of data.similar_words) {
		const candidat = item.word;	
		const normCandidat = normalize(candidat);
		if (!normCandidat.includes(normalize(word)) && (await checkWord( normCandidat))){
			return item.word;
		}
	}
	return data.similar_words[0].word;
}

function normalize(str: string): string {
	return str
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/(s|x|z|à)$/g, '')
		.trim()
		
}
async function checkWord(word: string) {
	let isWordExist = true;
	try {
		const response = await globalThis.fetch('http://localhost:5000/api/check-word', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				word: word
			})
		});
		const data = await response.json();
		if (!data.exists) {
			isWordExist = false;
			return isWordExist;
		}
		return isWordExist;
	} catch (error) {
		console.error('Erreur lors de la vérification du mot:', error);
		return false;
	}
}
