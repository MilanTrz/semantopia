import type { hints } from '$lib/models/hints';
import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

const activeSessions: Map<string, {
	titleWikiPage: string;
	titleWikiPageSplit: string[];
	contentsplice: string[];
	tabHiddenTitle: (number | string)[];
	tabHiddenContent: (number | string)[];
}> = new Map();

export async function POST({ request }: RequestEvent) {
	const { userGuess, sessionId } = await request.json();
	const session = activeSessions.get(sessionId);

	if (!session) {
		return new Response(JSON.stringify({ message: 'Session non trouvée', isWordInGame: false }), {
			status: 400
		});
	}

	const { titleWikiPageSplit, contentsplice, tabHiddenTitle, tabHiddenContent } = session;

	try {
		const normalizedGuess = userGuess.toLowerCase().trim();

		let foundInTitle = false;
		let foundInContent = false;

		titleWikiPageSplit.forEach((word) => {
			if (word.toLowerCase() === normalizedGuess) {
				foundInTitle = true;
			}
		});
		contentsplice.forEach((word) => {
			if (word.toLowerCase() === normalizedGuess) {
				foundInContent = true;
			}
		});
		if (foundInTitle || foundInContent) {
			await Promise.all([
				...contentsplice.map(async (word, index) => {
					if (await checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
						tabHiddenContent[index] = word;
					}
				}),
				...titleWikiPageSplit.map(async (word, index) => {
					if (await checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
						tabHiddenTitle[index] = word;
					}
				})
			]);

			session.tabHiddenTitle = tabHiddenTitle;
			session.tabHiddenContent = tabHiddenContent;

			return new Response(
				JSON.stringify({
					tabHiddenTitle,
					tabHiddenContent,
					isWordInGame : true
				}),
				{ status: 201 }
			);
		}

		const isWordInGame = await checkWord(userGuess);

		if (!isWordInGame) {
			return new Response(JSON.stringify({ message: 'Le mot n existe pas ou n est pas présent dans le titre ou le contenu', isWordInGame: false }), {
				status: 200
			});
		}
		await Promise.all([
			...contentsplice.map(async (word, index) => {
				if (await checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
					tabHiddenContent[index] = word;
				}
			}),
			...titleWikiPageSplit.map(async (word, index) => {
				if (await checkSimilarity(word.toLowerCase(), userGuess.toLowerCase())) {
					tabHiddenTitle[index] = word;
				}
			})
		]);

		session.tabHiddenTitle = tabHiddenTitle;
		session.tabHiddenContent = tabHiddenContent;

		return new Response(
			JSON.stringify({
				tabHiddenTitle,
				tabHiddenContent,
				isWordInGame : true
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
	const userId = Number(url.searchParams.get('userId'));
	const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	let hints : hints;
	let titleWikiPage: string;
	let titleWikiPageSplit: string[];
	let contentsplice: string[];
	
	do{
		titleWikiPage = await getRandomTitlePage();
		hints = await getHints(titleWikiPage);
		titleWikiPageSplit = titleWikiPage
		.split(/(\s+|[.,!?;:()[\]{}"'«»])/g)
		.filter((s) => s.trim() !== '');
	contentsplice = await getContentPage(titleWikiPage);
	}while (contentsplice.length == 0);
	
	
	const tabHiddenTitle = titleWikiPageSplit.map((str) =>
		/^[.,!?;:()[\]{}"'«»\-–—]$/.test(str) ? str : str.length
	);

	const tabHiddenContent = contentsplice.map((str) =>
		/^[.,!?;:()[\]{}"'«»\-–—]$/.test(str) ? str : str.length
	);

	activeSessions.set(sessionId, {
		titleWikiPage,
		titleWikiPageSplit,
		contentsplice,
		tabHiddenTitle,
		tabHiddenContent
	});

	const date = new Date();
	if (userId !== 0) {
		await pool.query(
			'INSERT INTO GAME_SESSION(DATE_PARTIE,EN_COURS,NOMBRE_ESSAI,TYPE,WIN,USER_ID) VALUES(?,1,0,"pedantix",0,?) ',
			[date, userId]
		);
	}

	try {
		return new Response(
			JSON.stringify({
				sessionId,
				tabHiddenTitle,
				tabHiddenContent,
				hints
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
	const words = text
		.replace(/([.,!?;:()[\]{}"'«»\-–—])/g, ' $1 ')
		.split(/\s+/) 
		.filter((word: string) => word !== '');

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

async function checkSimilarity(wordTab: string, wordGuess: string) {
	const newWord = wordGuess.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const newWordTab = wordTab.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	
	if (newWord.toLowerCase() === newWordTab.toLowerCase()) {
		return true;
	}
	
	try {
		const response = await fetch('http://localhost:5000/api/similarity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				word1: newWord,
				word2: newWordTab
			})
		});
		const data = await response.json();
		if (data.similarity >= 0.8) {
			return true;
		}
		return false;
	} catch (error) {
		console.error('Erreur lors de la vérification de similarité:', error);
		return newWord.toLowerCase() === newWordTab.toLowerCase();
	}
}

export async function PUT({ request }: RequestEvent) {
	const { nbEssai, isVictory, idUser } = await request.json();

	try {
		const [row_max] = (await pool.query(
			'SELECT MAX(ID) AS ID FROM GAME_SESSION WHERE USER_ID = ?',
			[idUser]
		)) as [Array<{ ID: number }>, unknown];
		const idMax = row_max[0].ID;
		if (isVictory) {
			await pool.query(
				'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 1  WHERE USER_ID = ?  AND ID = ? AND TYPE = ? ',
				[nbEssai, idUser, idMax, 'pedantix']
			);
		} else {
			await pool.query(
				'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 0 WHERE USER_ID = ? AND ID= ? AND TYPE = ?',
				[nbEssai, idUser, idMax, 'pedantix']
			);
		}
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Erreur Server:', error);
		throw error;
	}
}

async function getHints(title: string, lang: string = "fr"): Promise<hints> {
    const base = `https://${lang}.wikipedia.org/w/api.php`;

    const makeUrl = (extra: Record<string, string>) =>
        base +
        "?" +
        new URLSearchParams({
            format: "json",
            origin: "*",
            action: "query",
            titles: title,
            ...extra
        });

    const [catRes, introRes, linksRes] = await Promise.all([
        fetch(makeUrl({ prop: "categories" })),
        fetch(makeUrl({ prop: "extracts", exintro: "true", explaintext: "true" })),
        fetch(makeUrl({ prop: "links", pllimit: "10" }))
    ]);

    const catData = await catRes.json() as {
        query: { pages: Record<string, { categories?: { title: string }[] }> }
    };

    const introData = await introRes.json() as {
        query: { pages: Record<string, { extract?: string }> }
    };

    const linksData = await linksRes.json() as {
        query: { pages: Record<string, { links?: { title: string }[] }> }
    };

    const pageId = Object.keys(catData.query.pages)[0];

    const rawIntro = introData.query.pages[pageId].extract ?? "";

    const titleRegex = new RegExp(title, "gi");
    const censoredIntro = rawIntro.replace(titleRegex, "…");

	  const shortIntro = censoredIntro.length > 50
        ? censoredIntro.slice(0, 50) + "…"
        : censoredIntro;

		const links = linksData.query.pages[pageId].links?.slice(0, 3).map(l => l.title) ?? [];

    return {
        categories: catData.query.pages[pageId].categories?.map(c => c.title) ?? [],
        intro: shortIntro,
        links: links
    };
}

async function checkWord(word: string){
	let isWordExist = true;
    try{
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
    }catch (error) {
		console.error('Erreur lors de la vérification du mot:', error);
		return false;
	}
}
