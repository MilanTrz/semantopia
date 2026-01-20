import type { RequestEvent } from '@sveltejs/kit';
import pool from '$lib/server/db';
import type { RowDataPacket } from 'mysql2';

export async function GET({ params }: RequestEvent) {
	try {
		const userId = Number(params.userId);

		if (!userId || isNaN(userId)) {
			return new Response(JSON.stringify({ message: 'ID utilisateur invalide' }), { status: 400 });
		}

		const connection = await pool.getConnection();
		try {
			const [rows] = await connection.query<RowDataPacket[]>(
				'SELECT ID, CREATION_DATE FROM USERS WHERE ID = ?',
				[userId]
			);

			if (!Array.isArray(rows) || rows.length === 0) {
				return new Response(JSON.stringify({ message: 'Utilisateur non trouvé' }), { status: 404 });
			}

			if (rows.length == 0) {
				return new Response(JSON.stringify({ message: 'Aucun compte trouvé' }), {
					status: 200
				});
			}
			return new Response(
				JSON.stringify({
					id: rows[0].ID,
					createdAt: rows[0].CREATION_DATE || new Date().toISOString()
				}),
				{ status: 200 }
			);
		} finally {
			connection.release();
		}
	} catch (error) {
		console.error('Erreur serveur:', error);
		return new Response(JSON.stringify({ message: 'Erreur serveur: ' + error }), { status: 500 });
	}
}
