import type { RequestEvent } from '@sveltejs/kit';
import pool from '$lib/server/db';
export async function POST({ request }: RequestEvent) {
	const {
		nameChallenge,
		descriptionChallenge,
		gameNameChallenge,
		nbHintChallenge,
		nbTryChallenge
	} = await request.json();
	try {
		const nbHint = nbHintChallenge ?? -1;
		const nbTry = nbTryChallenge ?? -1;
		await pool.query(
			'INSERT INTO Challenge(NAME,DESCRIPTION,GAMENAME,NBTRY,NBHINT) VALUES (?,?,?,?,?)',
			[nameChallenge, descriptionChallenge, gameNameChallenge, nbTry, nbHint]
		);
		return new Response(
			JSON.stringify({
				message: 'Défi créer'
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
