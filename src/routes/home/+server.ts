import pool from '$lib/server/db';
import type { RowDataPacket } from 'mysql2';
import type { RequestEvent } from './$types';
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
