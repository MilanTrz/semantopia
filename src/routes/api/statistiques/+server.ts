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
	console.log(userId, gameType);
	try {
		const [row_game]: [GameStats[], unknown] = await pool.query(
			`
    SELECT
        USER_ID,
        TYPE,
        COUNT(ID) AS NB_PARTIES_JOUES,
        AVG(NOMBRE_ESSAI) AS NB_ESSAI_MOYEN,
		AVG(SCORE) AS SCORE_MOYEN,
		MAX(SCORE) AS MAX_SCORE,
        SUM(WIN) / COUNT(ID) AS TAUX_REUSSITE,
        (
            SELECT COUNT(*)
            FROM GAME_SESSION gs2
            WHERE gs2.USER_ID = GAME_SESSION.USER_ID
              AND gs2.TYPE = GAME_SESSION.TYPE
              AND gs2.WIN = 1
              AND gs2.ID > COALESCE(
                  (
                      SELECT MAX(gs3.ID)
                      FROM GAME_SESSION gs3
                      WHERE gs3.USER_ID = GAME_SESSION.USER_ID
                        AND gs3.TYPE = GAME_SESSION.TYPE
                        AND gs3.WIN = 0
                  ), 0
              )
        ) AS SERIE_ACTUELLE
    FROM GAME_SESSION
    WHERE USER_ID = ? AND TYPE = ?
    GROUP BY USER_ID, TYPE
    ORDER BY USER_ID, TYPE;
    `,
			[userId, gameType]
		);
		const stats = row_game[0];
		const nbParties = stats.NB_PARTIES_JOUES ?? 0;
		const nbEssaiMoyen = stats.NB_ESSAI_MOYEN ?? 0;
		const tauxReussite = stats.TAUX_REUSSITE ?? 0;
		const serieActuelle = stats.SERIE_ACTUELLE ?? 0;
		const scoreMoyen = stats.SCORE_MOYEN ?? 0;
		const scoreMax = stats.MAX_SCORE ?? 0;
		return new Response(
			JSON.stringify({
				nbParties,
				nbEssaiMoyen,
				tauxReussite,
				serieActuelle,
				scoreMoyen,
				scoreMax
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
export async function GET({ url }: RequestEvent) {
	const userId = Number(url.searchParams.get('userId'));
	try {
		const [rows_game] = (await pool.query(
			`
    SELECT
    COUNT(ID) AS NB_PARTIES_JOUES,
    SUM(WIN) / COUNT(ID) AS TAUX_REUSSITE
    FROM GAME_SESSION
    WHERE USER_ID = ? 	
    ORDER BY USER_ID, TYPE;
    `,
			[userId]
		)) as [Array<{ NB_PARTIES_JOUES: number; TAUX_REUSSITE: number }>, unknown];
		const nbParties = rows_game.reduce((acc, r) => acc + r.NB_PARTIES_JOUES, 0);
		const tauxReussite =
			rows_game.map((r) => Number(r.TAUX_REUSSITE)).reduce((a, b) => a + b, 0) / rows_game.length;
		return new Response(
			JSON.stringify({
				nbParties,
				tauxReussite
			}),
			{ status: 201 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
export async function PUT({ request }: RequestEvent) {
	const { userId } = await request.json();
	try {
		const [rows_histo] = await pool.query(
			'Select ID, TYPE, WIN, DATE_PARTIE FROM GAME_SESSION WHERE USER_ID = ? ORDER BY ID DESC LIMIT 3',
			[userId]
		);
		return new Response(
			JSON.stringify({
				rows_histo
			})
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
