import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import pool from "$lib/server/db";
export async function POST({request}){
    const { email_utilisateur, mdp_utilisateur, nom_utilisateur } =  await request.json();
    try{
         const [rows] = await pool.query(
      "SELECT * FROM utilisateur WHERE email_utilisateur = ?",
      [email_utilisateur]
    );
    if (rows.length() > 0) {
      await pool.end();
      return new Response(
        JSON.stringify({ message: "Cet email est déjà utilisé." }),
        { status: 400 }
      );
    }

   
    const [existingPseudo] = await pool.query(
      "SELECT nom_utilisateur FROM utilisateur WHERE LOWER(nom_utilisateur) = LOWER(?)",
      [nom_utilisateur]
    );

    if (existingPseudo.length > 0) {
      await pool.end();
      return new Response(
        JSON.stringify({ message: "Pseudo already exists" }),
        { status: 400 }
      );
    }

  
    const hashedPassword = await bcrypt.hash(mdp_utilisateur, 10);

    
    await pool.query(
      "INSERT INTO utilisateur (email_utilisateur, mdp_utilisateur, nom_utilisateur) VALUES (?, ?, ?)",
      [email_utilisateur, hashedPassword, nom_utilisateur]
    );

    await pool.end();
    return new Response(
      JSON.stringify({
        message: "Utilisateur créé avec succès. Redirection...",
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur serveur." }), {
      status: 500,
    });
  }
}
        
