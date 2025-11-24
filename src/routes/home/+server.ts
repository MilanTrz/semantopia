import pool from '$lib/server/db';
import type { RowDataPacket } from 'mysql2';
import type { RequestEvent } from './$types';
import { type challenge } from '$lib/models/challenge';
export async function POST({ request }: RequestEvent) {
	const { id } = await request.json();
	try {
		const [rows] = await pool.query<RowDataPacket[]>('SELECT PSEUDO FROM USERS WHERE ID = ?', [id]);
		const pseudo = rows[0].PSEUDO;
		return new Response(
			JSON.stringify({
				pseudo
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

export async function GET(){
	try{
		const [row_defi] = await pool.query<RowDataPacket[] & challenge[]>(
			'SELECT NAME, DESCRIPTION, GAMENAME, NBTRY, NBHINT FROM Challenge ORDER BY ID DESC LIMIT 1'
		)
		if (row_defi.length == 0) {
			return new Response(JSON.stringify({ message: 'Table Vide' }), {
				status: 400
			});
		}
		const lastChallenge : challenge = {
			name: row_defi[0].NAME,
			description: row_defi[0].DESCRIPTION,
			gameName: row_defi[0].GAMENAME,
			nbTry: row_defi[0].NBTRY,
			nbHint: row_defi[0].NBHINT
		}
		return new Response(
			JSON.stringify({
				lastChallenge
			}),
			{ status: 201 }
		);

	}catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error  }), {
			status: 500
		});
	}
}
