import pool from "$lib/server/db";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST({ request }: RequestEvent) {
    const { idUser } = await request.json();
    try {
        const [rowsChallenge] = await pool.query('SELECT COMPLETEDTODAYCHALLENGE FROM STATISTICS WHERE USER_ID = ?', [idUser]) as [Array<{ COMPLETEDTODAYCHALLENGE: boolean }>, unknown];
        
        if (!rowsChallenge || rowsChallenge.length === 0) {
            return new Response(JSON.stringify({ message: 'Utilisateur non trouvé.' }), {
                status: 404
            });
        }

        const completedTodayChallenge = rowsChallenge[0].COMPLETEDTODAYCHALLENGE;
        
        if (!completedTodayChallenge) {
            await pool.query('UPDATE STATISTICS SET NB_CHALLENGE = NB_CHALLENGE + 1, COMPLETEDTODAYCHALLENGE = 1 WHERE USER_ID = ?', [idUser]);
            return new Response(JSON.stringify({ message: 'Challenge mis à jour avec succès.' }), {
                status: 200
            });
        }
        
        return new Response(JSON.stringify({ message: 'Challenge déjà complété aujourd\'hui.' }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Erreur serveur.' + error }), {
            status: 500
        });
    }
}