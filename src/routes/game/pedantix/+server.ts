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

export async function GET() {
	titleWikiPage = await getRandomTitlePage();
	titleWikiPageSplit = titleWikiPage.split(' ');
	contentsplice = await getContentPage(titleWikiPage);
	tabHiddenTitle = titleWikiPageSplit.map((str) => str.length);
	tabHiddenContent = contentsplice.map((str) => str.length);

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

			if (page.length && page.length < 30000) {
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
	const forbiddenWords = ['Liste', 'Catégorie', 'Utilisateur', 'Discussion'];
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
