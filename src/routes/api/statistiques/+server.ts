import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';

interface GameStats extends RowDataPacket {
	USER_ID: number;
	TYPE: string;
	NB_PARTIES_JOUES: number;
	NB_ESSAI_MOYEN: number;
	TAUX_REUSSITE: number;
	SERIE_ACTUELLE?: number;
}

export async function POST({ request }: RequestEvent) {
	const { userId, gameType } = await request.json();
    console.log(userId,gameType);
	try {
		const [row_game]: [GameStats[], unknown] = await pool.query(
			`
    SELECT
    USER_ID,
    TYPE,
    COUNT(ID) AS NB_PARTIES_JOUES,
    AVG(NOMBRE_ESSAI) AS NB_ESSAI_MOYEN,
    SUM(WIN) / COUNT(ID) AS TAUX_REUSSITE
    FROM GAME_SESSION
    WHERE USER_ID = ? AND TYPE = ?
    GROUP BY USER_ID, TYPE
    ORDER BY USER_ID, TYPE;
    `,
			[userId, gameType]
		);
		const stats = row_game[0];
		const nbParties = stats.NB_PARTIES_JOUES ;
		const nbEssaiMoyen = stats.NB_ESSAI_MOYEN;
		const tauxReussite = stats.TAUX_REUSSITE;
		const serieActuelle = stats.SERIE_ACTUELLE ?? 0;
		return new Response(
			JSON.stringify({
				nbParties,
				nbEssaiMoyen,
				tauxReussite,
				serieActuelle
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
