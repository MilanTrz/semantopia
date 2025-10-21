import type { RequestEvent } from '@sveltejs/kit';

let titleWikiPage: string;
let titleWikiPageSplit: string[];
let contentsplice: string[];
let tabHiddenTitle: (number | string)[];
let tabHiddenContent: (number | string)[];


export async function POST({ request }: RequestEvent) {
   const {userGuess} = await request.json();

	try {
		
		contentsplice.forEach((word, index) => {
			if (word.toLowerCase() === userGuess.toLowerCase()) {
				tabHiddenContent[index] = word;
				
			}
		});
        titleWikiPageSplit.forEach((word,index) =>{
            if (word.toLowerCase() === userGuess.toLowerCase()) {
				tabHiddenTitle[index] = word;
				
			}
        })

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
		list: 'random',
		rnnamespace: '0',
		rnlimit: '1',
		format: 'json',
	});
	const randomResponse = await fetch(`${randomUrl}?${randomParams}`);
	const randomData = await randomResponse.json();
	const randomTitle: string = randomData.query.random[0].title;
	console.log(randomTitle);
	return randomTitle;
}

async function getContentPage(
	titlePage: string,
	lang: string = 'fr',
	numLines: number = 40
): Promise<string[]> {
	const url = `https://${lang}.wikipedia.org/w/api.php`;
	const params = new URLSearchParams({
		action: 'query',
		titles: titlePage,
		prop: 'extracts',
		exintro: 'false',
		explaintext: 'true',
		format: 'json',
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
