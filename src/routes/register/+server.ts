import bcrypt from 'bcrypt';
import pool from '$lib/server/db';
import type { RowDataPacket } from 'mysql2';
import type { RequestEvent } from './$types';
import { sessionStore } from '$lib/store/sessionStore';
import type { sessionData } from '$lib/store/sessionStore';
export async function POST({ request }: RequestEvent) {
	const now = new Date();
	const userDate = now.toISOString().slice(0, 19).replace('T', ' ');
	const { email, mdp, pseudo } = await request.json();
	try {
		const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM USERS WHERE EMAIL = ?', [
			email
		]);
		if (rows.length > 0) {
			return new Response(JSON.stringify({ message: 'Cet email est déjà utilisé.' }), {
				status: 400
			});
		}

		const [existingPseudo] = await pool.query<RowDataPacket[]>(
			'SELECT PSEUDO FROM USERS WHERE LOWER(PSEUDO) = LOWER(?)',
			[pseudo]
		);

		if (existingPseudo.length > 0) {
			return new Response(JSON.stringify({ message: 'Pseudo already exists' }), { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(mdp, 10);

		await pool.query(
			'INSERT INTO USERS (EMAIL, PASSWORD, PSEUDO,CREATION_DATE,AVATAR) VALUES (?, ?, ?, ?, ?)',
			[email, hashedPassword, pseudo, userDate, 'testlien']
		);

		const [rows_id] = (await pool.query('SELECT ID,PSEUDO FROM USERS WHERE EMAIL = ? ', [email])) as [
			Array<{ ID: number,PSEUDO: string }>,
			unknown
		];

		const id = rows_id[0].ID;
		const pseudoUser = rows_id[0].PSEUDO;
		const userInfo:sessionData = {id,pseudo:pseudoUser}
		sessionStore.set(userInfo);
		return new Response(
			JSON.stringify({
				message: 'Utilisateur créé avec succès. Redirection...'
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
