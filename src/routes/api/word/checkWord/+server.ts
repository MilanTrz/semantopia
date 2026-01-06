import { type RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
	const { word } = await request.json();
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
		}

		return new Response(JSON.stringify({ isWordExist }), {
			status: 200
		});
	} catch (error) {
		console.error('Erreur lors de la vérification du mot:', error);
		return new Response(
			JSON.stringify({ message: 'Erreur serveur.' + error, isWordExist: false }),
			{
				status: 500
			}
		);
	}
}
