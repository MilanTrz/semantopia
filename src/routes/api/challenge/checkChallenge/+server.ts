import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { challenge } from '$lib/models/challenge';

export async function POST({ request }: RequestEvent) {
	const {gameName} = await request.json()
	try{
		const [rowLastChallenge] = await pool.query<RowDataPacket[] & challenge[]>(
			'SELECT NAME, DESCRIPTION, GAMENAME, NBTRY, NBHINT FROM Challenge WHERE NAME = ? ORDER BY ID DESC LIMIT 1',
					[gameName]
		)
		if (rowLastChallenge.length == 0) {
			return new Response(JSON.stringify({ message: 'Aucun défi pour ce mode de jeu actuellement' }), {
				status: 400
			});
		}
		const lastChallenge : challenge = {
			name: rowLastChallenge[0].NAME,
			description: rowLastChallenge[0].DESCRIPTION,
			gameName: rowLastChallenge[0].GAMENAME,
			nbTry: rowLastChallenge[0].NBTRY,
			nbHint: rowLastChallenge[0].NBHINT
		}
		return new Response(
			JSON.stringify({
				lastChallenge
			}),
			{ status: 201 }
		);
	}catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}