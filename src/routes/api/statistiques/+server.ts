import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
	const { userId, gameType } = await request.json();
	try {
		// Déterminer si le jeu est "winnable" (SCORE est toujours NULL) ou basé sur le score
		const [rows_typeCheck] = (await pool.query(
			`SELECT COUNT(*) AS CNT_SCORE
			 FROM GAME_SESSION
			 WHERE USER_ID = ? AND TYPE = ? AND SCORE IS NOT NULL;`,
			[userId, gameType]
		)) as [Array<{ CNT_SCORE: number }>, unknown];
		const isScoreBased = (rows_typeCheck[0]?.CNT_SCORE ?? 0) > 0;

		if (isScoreBased) {
			// Jeux basés sur le score: on retourne le max_score et score_moyen. Taux de réussite et série n'ont pas de sens.
			const [rows_score] = (await pool.query(
				`
				SELECT
				  COUNT(ID) AS NB_PARTIES_JOUES,
				  AVG(SCORE) AS SCORE_MOYEN,
				  MAX(SCORE) AS MAX_SCORE
				FROM GAME_SESSION
				WHERE USER_ID = ? AND TYPE = ?;`,
				[userId, gameType]
			)) as [Array<{ NB_PARTIES_JOUES: number; SCORE_MOYEN: number; MAX_SCORE: number }>, unknown];

			const nbParties = rows_score[0]?.NB_PARTIES_JOUES ?? 0;
			const scoreMoyen = rows_score[0]?.SCORE_MOYEN ?? 0;
			const scoreMax = rows_score[0]?.MAX_SCORE ?? 0;

			return new Response(
				JSON.stringify({
					nbParties,
					scoreMoyen,
					scoreMax
				}),
				{ status: 201 }
			);
		}

		// Jeux "winnable": on calcule min_essais et nombre de win, moyenne d'essais, taux de réussite et série actuelle
		const [rows_win] = (await pool.query(
			`
			SELECT
			  USER_ID,
			  TYPE,
			  COUNT(ID) AS NB_PARTIES_JOUES,
			  AVG(NOMBRE_ESSAI) AS NB_ESSAI_MOYEN,
			  SUM(WIN) / NULLIF(COUNT(ID), 0) AS TAUX_REUSSITE,
			  MIN(NOMBRE_ESSAI) AS MIN_ESSAIS,
			  SUM(WIN) AS WINS,
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
			ORDER BY USER_ID, TYPE;`,
			[userId, gameType]
		)) as [Array<{ NB_PARTIES_JOUES: number; NB_ESSAI_MOYEN: number; TAUX_REUSSITE: number; MIN_ESSAIS: number; WINS: number; SERIE_ACTUELLE: number }>, unknown];

		if (!rows_win || rows_win.length === 0) {
		return new Response(
			JSON.stringify({
				nbParties: 0,
				nbEssaiMoyen: 0,
				tauxReussite: 0,
				serieActuelle: 0,
				wins: 0
			}),
			{ status: 200 }
		);
	}
		const stats = rows_win[0];
		const nbParties = stats.NB_PARTIES_JOUES ?? 0;
		const nbEssaiMoyen = stats.NB_ESSAI_MOYEN ?? 0;
		const tauxReussite = stats.TAUX_REUSSITE ?? 0;
		const serieActuelle = stats.SERIE_ACTUELLE ?? 0;
		const minEssais = stats.MIN_ESSAIS ?? 0;
		const wins = stats.WINS ?? 0;
		return new Response(
			JSON.stringify({
				nbParties,
				nbEssaiMoyen,
				tauxReussite,
				serieActuelle,
				minEssais,
				wins
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
      SUM(CASE WHEN SCORE IS NULL THEN WIN ELSE 0 END) 
        / NULLIF(COUNT(CASE WHEN SCORE IS NULL THEN ID END), 0) AS TAUX_REUSSITE
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
      SUM(CASE WHEN SCORE IS NULL THEN WIN ELSE 0 END) AS WINS,
      MIN(CASE WHEN SCORE IS NULL THEN NOMBRE_ESSAI END) AS MIN_ESSAIS,
      MAX(CASE WHEN SCORE IS NOT NULL THEN SCORE END) AS MAX_SCORE
    FROM GAME_SESSION
    WHERE USER_ID = ?
    GROUP BY TYPE;
    `,
			[userId]
		)) as [Array<{ TYPE: string; NB_PARTIES: number; WINS: number; MIN_ESSAIS: number | null; MAX_SCORE: number | null }>, unknown];

		const nbParties = rows_game[0]?.NB_PARTIES_JOUES ?? 0;
		const tauxReussiteRaw = rows_game[0]?.TAUX_REUSSITE ?? 0;
		const tauxReussite = Number.isFinite(tauxReussiteRaw) ? Number(tauxReussiteRaw) : 0;
		const totalGameTypes = rows_gameTypes[0]?.NB_GAME_TYPES ?? 0;

		// Construire l'objet games par type
		const games: Record<string, Record<string, number>> = {};
		rows_byGame.forEach((row) => {
			const gameType = row.TYPE.toLowerCase();
			const isScoreBased = row.MAX_SCORE !== null;
			
			if (isScoreBased) {
				games[gameType] = {
					parties: row.NB_PARTIES,
					maxScore: row.MAX_SCORE ?? 0
				};
			} else {
				const gameObj: Record<string, number> = {
					parties: row.NB_PARTIES,
					wins: row.WINS ?? 0
				};
				if (row.MIN_ESSAIS !== null) {
					gameObj.minEssais = row.MIN_ESSAIS;
				}
				games[gameType] = gameObj;
			}
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
