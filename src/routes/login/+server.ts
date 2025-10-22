import pool from '$lib/server/db';
import bcrypt from 'bcrypt';
import type { RowDataPacket } from 'mysql2';
import type { RequestEvent } from './$types';
export async function POST({ request }: RequestEvent) {
	const { email, mdp } = await request.json();
	try {
		const [rows] = await pool.query<RowDataPacket[]>('SELECT PASSWORD FROM USERS WHERE EMAIL = ?', [
			email
		]);
		if (rows.length == 0) {
			return new Response(JSON.stringify({ message: "L'email n'existe pas" }), { status: 400 });
		}

		const hashedPasswordFromBD = rows[0].PASSWORD;

		if (!(await bcrypt.compare(mdp, hashedPasswordFromBD))) {
			return new Response(JSON.stringify({ message: "Le mdp n'est pas lié au compte" }), {
				status: 400
			});
		}

		const [rows_id] = (await pool.query('SELECT ID, PSEUDO FROM USERS WHERE EMAIL = ? ', [
			email
		])) as [Array<{ ID: number; PSEUDO: string }>, unknown];

		const userId = rows_id[0].ID;
		const pseudo = rows_id[0].PSEUDO;
		return new Response(
			JSON.stringify({
				message: 'Connexion établie. Redirection...',
				userId,
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
