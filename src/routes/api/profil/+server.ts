import pool from '$lib/server/db';
import { type RequestEvent } from '@sveltejs/kit';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function POST({ request }: RequestEvent) {
	try {
		const data = await request.formData();
		const userId = Number(data.get('userId'));
		const file = data.get('file') as File;
		const newFilePath = data.get('newFilePath');
		if (!newFilePath || typeof newFilePath !== 'string') {
			return new Response(JSON.stringify({ message: 'Chemin de fichier manquant ou invalide.' }), {
				status: 400
			});
		}
		const [rowsUser] = (await pool.query('SELECT AVATAR FROM USERS WHERE ID = ?', [userId])) as [
			Array<{ AVATAR: string }>,
			unknown
		];
		const oldPathFile: string = rowsUser[0].AVATAR;

		if (existsSync(oldPathFile)) {
			await unlink(oldPathFile);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await writeFile(newFilePath, buffer);
		await pool.query('UPDATE USERS SET AVATAR = ? WHERE ID = ?', [newFilePath, userId]);

		return new Response(JSON.stringify(null), { status: 200 });
	} catch (error) {
		console.error('Erreur serveur complète :', error);
		return new Response(
			JSON.stringify({ message: 'Erreur serveur : ' + (error as Error).message }),
			{ status: 500 }
		);
	}
}
