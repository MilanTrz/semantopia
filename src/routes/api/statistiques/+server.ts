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
		if (!row_game || row_game.length === 0) {
		return new Response(
			JSON.stringify({
				nbParties: 0,
				nbEssaiMoyen: 0,
				tauxReussite: 0,
				serieActuelle: 0,
				scoreMoyen: 0,
				scoreMax: 0
			}),
			{ status: 200 }
		);
	}
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
      SUM(WIN) / NULLIF(COUNT(ID), 0) AS TAUX_REUSSITE
    FROM GAME_SESSION
    WHERE USER_ID = ?;
    `,
			[userId]
		)) as [Array<{ NB_PARTIES_JOUES: number; TAUX_REUSSITE: number }>, unknown];

		const [rows_gameTypes] = (await pool.query(
			`SELECT COUNT(DISTINCT TYPE) AS NB_GAME_TYPES FROM GAME_SESSION WHERE USER_ID = ?;`,
			[userId]
		)) as [Array<{ NB_GAME_TYPES: number }>, unknown];

		// Récupérer les statistiques par jeu
		const [rows_byGame] = (await pool.query(
			`
    SELECT
      TYPE,
      COUNT(ID) AS NB_PARTIES,
      SUM(WIN) AS WINS,
      MAX(NOMBRE_ESSAI) AS MAX_SCORE
    FROM GAME_SESSION
    WHERE USER_ID = ?
    GROUP BY TYPE;
    `,
			[userId]
		)) as [Array<{ TYPE: string; NB_PARTIES: number; WINS: number; MAX_SCORE: number }>, unknown];

		const nbParties = rows_game[0]?.NB_PARTIES_JOUES ?? 0;
		const tauxReussiteRaw = rows_game[0]?.TAUX_REUSSITE ?? 0;
		const tauxReussite = Number.isFinite(tauxReussiteRaw) ? Number(tauxReussiteRaw) : 0;
		const totalGameTypes = rows_gameTypes[0]?.NB_GAME_TYPES ?? 0;

		// Construire l'objet games par type
		const games: Record<string, { parties?: number; wins?: number; maxScore?: number }> = {};
		rows_byGame.forEach((row) => {
			const gameType = row.TYPE.toLowerCase();
			games[gameType] = {
				parties: row.NB_PARTIES,
				wins: row.WINS ?? 0,
				maxScore: row.MAX_SCORE ?? 0
			};
		});

		return new Response(
			JSON.stringify({
				nbParties,
				tauxReussite,
				totalGameTypes,
				games
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
