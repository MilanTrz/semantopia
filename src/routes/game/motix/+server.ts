import type { RequestEvent } from '@sveltejs/kit';

let findWord: string;
let tabWord: string[];
export async function POST({ request }: RequestEvent) {
	const { sizeWord } = await request.json();

	try {
		findWord = await getRandomWord(sizeWord);
		tabWord = findWord.split('');
		return new Response(
			JSON.stringify({
				tabWord
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

async function getRandomWord(sizeWord: number): Promise<string> {
	console.log(sizeWord);
	const response = await fetch('https://trouve-mot.fr/api/size/' + sizeWord);
	if (!response.ok) {
		throw new Error('Erreur lors de la récupération du mot');
	}
	const data = await response.json();
	console.log(data);
	return data[0].name;
}
