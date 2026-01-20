import { getTotalGameTypes } from '$lib/gameConfig';

export interface Achievement {
	id: number;
	title: string;
	description: string;
	icon: string;
	rarity: number; // 0 = commun, 1 = rare
	condition: (gameData: GameEventData) => boolean;
}

export interface GameEventData {
	userId: number;
	type:
		| 'pedantix'
		| 'cemantix'
		| 'correlix'
		| 'motix'
		| 'lettix'
		| 'mimix'
		| 'panix'
		| 'chainix'
		| 'none';
	won?: boolean;
	attempts?: number;
	score?: number;
	timeElapsed?: number;
	totalGamesPlayed?: number;
	totalGameTypes?: number;
	accountAgeMs?: number;
	isDevTeamMember?: boolean;
	konamiCode?: boolean;
	wordGameWins?: number; // Victoires sur pedantix, cemantix, correlix, motix
	letterGameScore?: number; // Score sur lettix, mimix, panix, chainix
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: 1,
		title: 'Premier pas',
		description: 'Jouer votre première partie',
		icon: 'fa-shoe-prints',
		rarity: 0,
		condition: (data) => data.totalGamesPlayed !== undefined && data.totalGamesPlayed >= 1
	},
	{
		id: 2,
		title: 'Joueur confirmé',
		description: 'Jouer 10 parties',
		icon: 'fa-star',
		rarity: 0,
		condition: (data) => data.totalGamesPlayed !== undefined && data.totalGamesPlayed >= 10
	},
	{
		id: 3,
		title: 'Divinité de Sémantopia',
		description: 'Jouer 50 parties',
		icon: 'fa-crown',
		rarity: 1,
		condition: (data) => data.totalGamesPlayed !== undefined && data.totalGamesPlayed >= 50
	},
	{
		id: 4,
		title: 'Apprenti sémantopiste',
		description: 'Jouer à tous les jeux',
		icon: 'fa-graduation-cap',
		rarity: 1,
		condition: (data) => (data.totalGameTypes ?? 0) >= getTotalGameTypes()
	},
	{
		id: 5,
		title: 'Bling-Bling',
		description: 'Obtenir 5 badges',
		icon: 'fa-gem',
		rarity: 0,
		condition: () => false // on AchievementManager.ts
	},
	{
		id: 6,
		title: 'Couvre moi de badges',
		description: 'Obtenir 10 badges',
		icon: 'fa-shield',
		rarity: 1,
		condition: () => false // on AchievementManager.ts
	},
	{
		id: 7,
		title: 'Fin ?',
		description: 'Obtenir tous les badges',
		icon: 'fa-trophy',
		rarity: 2,
		condition: () => false // on AchievementManager.ts
	},
	{
		id: 8,
		title: 'Juniors de Sémantopia',
		description: "Compte d'une semaine",
		icon: 'fa-calendar',
		rarity: 0,
		condition: (data) =>
			data.accountAgeMs !== undefined && data.accountAgeMs >= 7 * 24 * 60 * 60 * 1000
	},
	{
		id: 9,
		title: 'Vétéran de Sémantopia',
		description: "Compte d'un mois",
		icon: 'fa-medal',
		rarity: 0,
		condition: (data) =>
			data.accountAgeMs !== undefined && data.accountAgeMs >= 30 * 24 * 60 * 60 * 1000
	},
	{
		id: 10,
		title: 'Séniors de Sémantopia',
		description: 'Compte de 3 mois',
		icon: 'fa-ring',
		rarity: 1,
		condition: (data) =>
			data.accountAgeMs !== undefined && data.accountAgeMs >= 90 * 24 * 60 * 60 * 1000
	},
	{
		id: 11,
		title: 'Créateur',
		description: 'Être développeur de Sémantopia',
		icon: 'fa-code',
		rarity: 2,
		condition: (data) => data.isDevTeamMember === true
	},
	{
		id: 12,
		title: '???',
		description: 'Faire le konami code',
		icon: 'fa-keyboard',
		rarity: 1,
		condition: () => false // on konamiCode.ts
	},
	{
		id: 13,
		title: 'Chasseur de mots',
		description: 'Gagner 5 parties sur pédantix, cémantix, corrélix, motix',
		icon: 'fa-book',
		rarity: 1,
		condition: (data) => (data.wordGameWins ?? 0) === 1
	},
	{
		id: 14,
		title: 'Chasseur de lettres',
		description: 'Faire un score de 5 sur lettix, mimix, panix, chainix',
		icon: 'fa-font',
		rarity: 1,
		condition: (data) => (data.letterGameScore ?? 0) === 1
	},
	{
		id: 15,
		title: 'Une idée brillante',
		description: 'Gagner une partie de pédantix en moins de 25 essais',
		icon: 'fa-lightbulb',
		rarity: 0,
		condition: (data) =>
			data.type === 'pedantix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 25
	},
	{
		id: 16,
		title: 'Œil pour œil, mot pour mot',
		description: 'Gagner une partie de pédantix en moins de 10 essais',
		icon: 'fa-eye',
		rarity: 1,
		condition: (data) =>
			data.type === 'pedantix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 10
	},
	{
		id: 17,
		title: 'Dans le mille',
		description: 'Gagner une partie de motix en 2 coups',
		icon: 'fa-bullseye',
		rarity: 1,
		condition: (data) => data.type === 'motix' && (data.won ?? false) && data.attempts === 2
	},
	{
		id: 18,
		title: 'Merci pour la partie',
		description: 'Gagner une partie de cémantix en moins de 30 essais',
		icon: 'fa-handshake',
		rarity: 0,
		condition: (data) =>
			data.type === 'cemantix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 30
	},
	{
		id: 19,
		title: 'Prends en de la graine',
		description: 'Gagner une partie de cémantix en moins de 15 essais',
		icon: 'fa-seedling',
		rarity: 1,
		condition: (data) =>
			data.type === 'cemantix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 15
	},
	{
		id: 20,
		title: 'La clé du succès',
		description: 'Gagner une partie sur corrélix en moins de 3 étapes',
		icon: 'fa-key',
		rarity: 0,
		condition: (data) =>
			data.type === 'correlix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 3
	},
	{
		id: 21,
		title: 'Sérieux dévouement',
		description: 'Gagner une partie sur corrélix en moins de 10 essais',
		icon: 'fa-heart',
		rarity: 1,
		condition: (data) =>
			data.type === 'correlix' && (data.won ?? false) && data.attempts !== undefined && data.attempts < 10
	}
];
