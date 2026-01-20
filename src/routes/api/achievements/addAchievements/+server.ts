import type { RequestEvent } from './$types';
import pool from '$lib/server/db';

export async function POST({ request }: RequestEvent) {
	const { userId, idAchievement } = await request.json();
	const date = new Date();

	if (!userId || !idAchievement) {
		return new Response(
			JSON.stringify({ message: 'Paramètres manquants: userId ou idAchievement' }),
			{ status: 400 }
		);
	}

	try {
		const connection = await pool.getConnection();
		try {
			// Vérifier si l'achievement est déjà enregistré pour cet utilisateur
			const [rows] = await connection.query(
				'SELECT ID FROM ACHIEVEMENTS WHERE USER_ID = ? AND ID_ACHIEVEMENT = ? LIMIT 1',
				[userId, idAchievement]
			);

			if (Array.isArray(rows) && rows.length > 0) {
				// Déjà acquis: API idempotente
				return new Response(JSON.stringify({ message: 'Achievement déjà acquis' }), {
					status: 409
				});
			}

			await connection.query(
				'INSERT INTO ACHIEVEMENTS (USER_ID, UNLOCK_DATE, ID_ACHIEVEMENT) VALUES (?,?,?)',
				[userId, date, idAchievement]
			);

			return new Response(JSON.stringify({ message: 'Succès enregistré' }), { status: 201 });
		} finally {
			connection.release();
		}
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur. ' + error }), {
			status: 500
		});
	}
}
