import type { ClassementType, ClassementEntry } from "$lib/types/leaderboard";

export async function getClassement(type: ClassementType): Promise<ClassementEntry[]> {
  try {
    const response = await fetch(`/leaderboard?type=${type}`);
    
    if (!response.ok) {
      console.error('Erreur HTTP:', response.status);
      return [];
    }
    
    const data: ClassementEntry[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement du classement:', error);
    return [];
  }
}