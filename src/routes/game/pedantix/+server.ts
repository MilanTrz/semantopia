import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import levenshtein from 'js-levenshtein';
let titleWikiPage: string;
let titleWikiPageSplit: string[];
let contentsplice: string[];
let tabHiddenTitle: (number | string)[];
let tabHiddenContent: (number | string)[];


export async function POST({ request }: RequestEvent) {
	const { userGuess } = await request.json();

	try {
		contentsplice.forEach((word, index) => {
			if (checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
				tabHiddenContent[index] = word;
			}
		});
		titleWikiPageSplit.forEach((word, index) => {
			if (checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
				tabHiddenTitle[index] = word;
			}
		});

		return new Response(
			JSON.stringify({
				tabHiddenTitle,
				tabHiddenContent
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

export async function GET({ url }: RequestEvent) {
	const  userId  = url.searchParams.get('userId')
	titleWikiPage = await getRandomTitlePage();
	titleWikiPageSplit = titleWikiPage.split(' ');
	contentsplice = await getContentPage(titleWikiPage);
	tabHiddenTitle = titleWikiPageSplit.map((str) => str.length);
	tabHiddenContent = contentsplice.map((str) => str.length);
	const date = new Date();
	await pool.query(
		'INSERT INTO GAME_SESSION(DATE_PARTIE,EN_COURS,NOMBRE_ESSAI,TYPE,WIN,USER_ID) VALUES(?,1,0,"pedantix",0,?) ',
		[date,userId]
	)

	try {
		return new Response(
			JSON.stringify({
				tabHiddenTitle,
				tabHiddenContent
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

async function getRandomTitlePage(lang: string = 'fr'): Promise<string> {
	const randomUrl = `https://${lang}.wikipedia.org/w/api.php`;
	const randomParams = new URLSearchParams({
		action: 'query',
		generator: 'random',
		grnnamespace: '0',
		grnlimit: '5',
		prop: 'extracts|info',
		exintro: 'false',
		explaintext: 'true',
		exchars: '2000',
		format: 'json',
		origin: '*'
	});
	try {
		const randomResponse = await fetch(`${randomUrl}?${randomParams}`);
		const randomData = await randomResponse.json();
		const pages = randomData.query.pages;
		for (const pageId in pages) {
			const page = pages[pageId];

			if (page.length && page.length > 70000) {
				continue;
			}

			if (!isValideTitle(page.title)) {
				continue;
			}
			console.log(page.title);
			return page.title;
		}
		return await getRandomTitlePage();
	} catch (error) {
		console.error('Erreur lors de la récupération du titre aléatoire:', error);
		throw error;
	}
}

async function getContentPage(
	titlePage: string,
	lang: string = 'fr',
	numLines: number = 30
): Promise<string[]> {
	const url = `https://${lang}.wikipedia.org/w/api.php`;
	const params = new URLSearchParams({
		action: 'query',
		titles: titlePage,
		prop: 'extracts',
		exintro: 'false',
		explaintext: 'true',
		format: 'json',
		origin: '*'
	});

	const response = await fetch(`${url}?${params}`);
	const data = await response.json();

	const pages = data.query.pages;
	const pageId = Object.keys(pages)[0];
	const page = pages[pageId];

	const lines = page.extract.split('\n').filter((line: string) => line.trim() !== '');
	const firstLines = lines.slice(0, numLines);

	const text = firstLines.join(' ');
	const words = text.split(/\s+/).filter((word: string) => word.trim() !== '');

	return words;
}

function isValideTitle(title: string): boolean {
	const forbiddenWords = [
		'Liste',
		'Catégorie',
		'Utilisateur',
		'Discussion',
		'Membres',
		'ordre',
		'alphabétique',
		'Communauté',
		'gens',
		'.'
	];
	const lowerTitle = title.toLowerCase();
	for (const word of forbiddenWords) {
		if (lowerTitle.includes(word.toLowerCase())) {
			return false;
		}
	}
	if (lowerTitle.match(/\d/)) {
		return false;
	}
	return true;
}

function checkSimilarity(wordTab: string, wordGuess: string): boolean {
	const newWord = wordGuess.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const distance = levenshtein(wordTab, newWord);
	const similarity = 1 - distance / Math.max(wordTab.length, wordGuess.length);
	if (similarity >= 0.5) {
		return true;
	}
	return false;
}

export async function PUT({ request }: RequestEvent){
	const { nbEssai,isVictory,idUser } = await request.json();

	try{
		const [row_max] = await pool.query(
				'SELECT MAX(ID) AS ID FROM GAME_SESSION WHERE USER_ID = ?',
				[idUser]
			)as [Array<{ ID: number; }>, unknown];
			const idMax = row_max[0].ID;

			const [row_max2] = await pool.query(
				'SELECT MAX(ID) - 1 AS ID FROM GAME_SESSION WHERE USER_ID = ?',
				[idUser]
			)as [Array<{ ID: number; }>, unknown];
			const idMax2 = row_max2[0].ID;
		
		if (isVictory){
			
			await pool.query(
			'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 1  WHERE USER_ID = ?  AND ID = ? ' ,
			[nbEssai,idUser,idMax]
			
		)
		}else{
			await pool.query(
			'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 0 WHERE USER_ID = ? AND ID= ?',
			[nbEssai,idUser,idMax2]
			)
		}
		return new Response(null, { status: 204 });
	}catch (error) {
		console.error('Erreur Server:', error);
		throw error;
	}
}