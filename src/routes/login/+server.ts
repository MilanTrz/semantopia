import pool from "$lib/server/db";
import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import type { RequestEvent } from "./$types";
import { sessionStore } from "$lib/store/sessionStore";
export async function POST({request} : RequestEvent){
    const { email, mdp} =  await request.json();
    try{
         const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT PASSWORD FROM USERS WHERE EMAIL = ?",
      [email]
    );
    if (rows.length == 0) {
      return new Response(
        JSON.stringify({ message: "L'email n'existe pas" }),
        { status: 400 }
      );
    }

   

    const {PASSWORD: hashedPasswordFromBD} = rows[0].PASSWORD;

     if (!(await bcrypt.compare(mdp, hashedPasswordFromBD))) {
      return new Response(
        JSON.stringify({ message: "Le mdp n'est pas lié au compte" }),
        { status: 400 }
      );
     }

    


   const [rows_id] = await pool.query(
        "SELECT ID FROM USERS WHERE EMAIL = ? ",
        [email]
    ) as [Array<{ ID: number; }>, unknown];

    const userId = rows_id[0].ID;
    sessionStore.set({userId});
    return new Response(
      JSON.stringify({
        message: "Connexion établie. Redirection...",
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur serveur." + error }), {
      status: 500,
    });
  }
}
        
