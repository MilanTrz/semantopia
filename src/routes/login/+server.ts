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

		const [rows_id] = (await pool.query(
			'SELECT ID, PSEUDO, AVATAR, CREATION_DATE FROM USERS WHERE EMAIL = ? ',
			[email]
		)) as [Array<{ ID: number; PSEUDO: string; AVATAR: string; CREATION_DATE: Date }>, unknown];

		const userId = rows_id[0].ID;
		const pseudo = rows_id[0].PSEUDO;
		const avatar = rows_id[0].AVATAR;
		const date = rows_id[0].CREATION_DATE;
		return new Response(
			JSON.stringify({
				message: 'Connexion établie. Redirection...',
				userId,
				pseudo,
				avatar,
				email,
				date
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
