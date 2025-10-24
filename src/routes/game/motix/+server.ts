import type { RequestEvent } from '@sveltejs/kit';
import pool from '$lib/server/db';
let findWord: string;
let tabWord: string[];
export async function POST({ request }: RequestEvent) {
	const { sizeWord, userId } = await request.json();

	try {
		findWord = await getRandomWord(sizeWord);
		tabWord = findWord
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.split('');
		const date = new Date();
		if (userId) {
			await pool.query(
				'INSERT INTO GAME_SESSION(DATE_PARTIE,EN_COURS,NOMBRE_ESSAI,TYPE,WIN,USER_ID) VALUES(?,1,0,"motix",0,?) ',
				[date, userId]
			);
		}

		return new Response(
			JSON.stringify({
				tabWord
			}),
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}

export async function PUT({ request }: RequestEvent) {
	const { nbEssai, isVictory, idUser } = await request.json();

	try {
		const [row_max] = (await pool.query(
			'SELECT MAX(ID) AS ID FROM GAME_SESSION WHERE USER_ID = ?',
			[idUser]
		)) as [Array<{ ID: number }>, unknown];
		const idMax = row_max[0].ID;
		if (isVictory) {
			await pool.query(
				'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 1  WHERE USER_ID = ?  AND ID = ? AND TYPE = ? ',
				[nbEssai, idUser, idMax, 'motix']
			);
		} else {
			await pool.query(
				'UPDATE GAME_SESSION SET EN_COURS = 0, NOMBRE_ESSAI = ?, WIN = 0 WHERE USER_ID = ? AND ID= ? AND TYPE = ?',
				[nbEssai, idUser, idMax, 'motix']
			);
		}
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Erreur Server:', error);
		throw error;
	}
}

async function getRandomWord(sizeWord: number): Promise<string> {
	console.log(sizeWord);
	const response = await fetch('https://trouve-mot.fr/api/size/' + sizeWord);
	if (!response.ok) {
		throw new Error('Erreur lors de la récupération du mot');
	}
	const data = await response.json();
	console.log(data);
	return data[0].name;
}
