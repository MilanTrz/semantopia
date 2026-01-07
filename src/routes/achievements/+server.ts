import pool from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
	const { userId } = await request.json();
	try {
		const [row_getAllAchi] = (await pool.query(
			'SELECT COUNT(ID) AS ALLACHI FROM ACHIEVEMENTS WHERE USER_ID = ?',
			[userId]
		)) as [Array<{ ALLACHI: number }>, unknown];

		const [row_getAllRareAchi] = (await pool.query(
			'SELECT COUNT(ID) AS ALLRAREACHI FROM ACHIEVEMENTS WHERE RARITY = 1 AND USER_ID = ?',
			[userId]
		)) as [Array<{ ALLRAREACHI: number }>, unknown];

		const [rows_allAchievementsUnlock] = (await pool.query(
			'SELECT ID_ACHIEVEMENT FROM ACHIEVEMENTS WHERE USER_ID = ?',
			[userId]
		)) as [Array<{ ID_ACHIEVEMENT: number }>, unknown];

		const AllAchievements = row_getAllAchi[0].ALLACHI ?? 0;
		const AllRareAchievements = row_getAllRareAchi[0].ALLRAREACHI ?? 0;
		const AllMissingAchievements = 21 - AllAchievements;
		const achievementsIds: number[] = rows_allAchievementsUnlock.map((row) => row.ID_ACHIEVEMENT);
		return new Response(
			JSON.stringify({
				AllAchievements,
				AllRareAchievements,
				AllMissingAchievements,
				achievementsIds
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}
