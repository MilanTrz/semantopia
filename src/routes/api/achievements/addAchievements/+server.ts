import type { RequestEvent } from "./$types";
import pool from '$lib/server/db';
export async function POST({request}:RequestEvent){
    const {userId, idAchievement,rarity} = await request.json();
    const date = new Date();
    try{
        await pool.query(
            'INSERT INTO ACHIEVEMENTS (USER_ID,UNLOCK_DATE,RARITY,ID_ACHIEVEMENT) VALUES (?,?,?,?)',
            [userId,date,rarity,idAchievement]
        );
        return new Response(
			JSON.stringify({message: 'Succes enregistré'}),
			{ status: 200 }
		);
    }catch (error) {
		return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
			status: 500
		});
	}
}