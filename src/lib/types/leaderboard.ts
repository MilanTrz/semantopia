export type ClassementType = 'mostGamePlayed' | 'mostAchievements' | 'mostVictory';

export interface ClassementEntry {
	pseudo: string;
	points: number;
	avatar: string;
}
