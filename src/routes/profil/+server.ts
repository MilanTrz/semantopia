import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export async function PUT({ request }: RequestEvent) {
	const { userId, pseudo, email, mdp } = await request.json();
	const hashedPassword = await bcrypt.hash(mdp, 10);
	try {
		await pool.query('UPDATE USERS SET EMAIL = ?,  PSEUDO = ?,  PASSWORD = ? WHERE ID = ?', [
			email,
			pseudo,
			hashedPassword,
			userId
		]);
		return new Response(JSON.stringify(null), {
			status: 200
		});
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
