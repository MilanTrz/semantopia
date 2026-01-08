import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import pool from '$lib/server/db';
import type { RowDataPacket } from 'mysql2';
import type { ClassementType, ClassementEntry } from "$lib/types/leaderboard";

async function getClassementFromDB(type: ClassementType): Promise<ClassementEntry[]> {
  switch(type) {
    case 'mostGamePlayed': {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT u.PSEUDO, COUNT(g.ID) AS TOTALGAMEPLAY, u.AVATAR
         FROM GAME_SESSION g
         JOIN USERS u ON u.ID = g.USER_ID
         GROUP BY u.ID, u.PSEUDO, u.AVATAR
         ORDER BY TOTALGAMEPLAY DESC 
         LIMIT 10`
      );

      return rows.map(row => ({
        pseudo: row.PSEUDO,
        points: row.TOTALGAMEPLAY ?? 0,
        avatar: row.AVATAR
      }));
    }
    
    case 'mostAchievements': {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(a.ID) AS TOTALACHIEVEMENTS, u.PSEUDO, u.AVATAR
         FROM ACHIEVEMENTS a
         JOIN USERS u ON u.ID = a.USER_ID
         GROUP BY u.ID, u.PSEUDO, u.AVATAR
         ORDER BY TOTALACHIEVEMENTS DESC 
         LIMIT 10`
      );
      
      return rows.map(row => ({
        pseudo: row.PSEUDO,
        points: row.TOTALACHIEVEMENTS ?? 0,
        avatar: row.AVATAR
      }));
    }
    
    case 'mostVictory': {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(g.ID) AS TOTALWIN, u.PSEUDO, u.AVATAR
         FROM GAME_SESSION g
         JOIN USERS u ON u.ID = g.USER_ID
         WHERE g.WIN = 1
         GROUP BY u.ID, u.PSEUDO, u.AVATAR
         ORDER BY TOTALWIN DESC 
         LIMIT 10`
      );
      
      return rows.map(row => ({
        pseudo: row.PSEUDO,
        points: row.TOTALWIN ?? 0,
        avatar: row.AVATAR
      }));
    }
    
    default:
      return [];
  }
}

export const GET: RequestHandler = async ({ url }) => {
  const type = (url.searchParams.get('type') || 'mostGamePlayed') as ClassementType;
  
  try {
    const data = await getClassementFromDB(type);
    return json(data);
  } catch (error) {
    console.error('Erreur API leaderboard:', error);
    return json([], { status: 500 });
  }
};