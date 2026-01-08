import type { GameEventData } from '$lib/models/achievements';
import { ACHIEVEMENTS } from '$lib/models/achievements';

export async function checkAndUnlockAchievements(
	eventData: GameEventData,
	currentUnlockedAchievements: number[]
) {
	try {
		if (eventData?.userId) {
			try {
				const statsResponse = await fetch(`/api/statistiques?userId=${eventData.userId}`);
				if (statsResponse.ok) {
					const stats = await statsResponse.json();
					eventData = {
						...eventData,
						totalGamesPlayed: stats.nbParties ?? eventData.totalGamesPlayed,
						totalGameTypes: stats.totalGameTypes ?? eventData.totalGameTypes
					};
				}
			} catch (statsError) {
				console.error('Erreur lors de la récupération des statistiques:', statsError);
			}
		}

		for (const achievement of ACHIEVEMENTS) {
			if (currentUnlockedAchievements.includes(achievement.id)) {
				continue;
			}

			if (achievement.id === 12 && eventData?.konamiCode === true) {
				await unlockAchievement(eventData.userId, achievement.id, achievement.rarity);
				continue;
			}

			if (achievement.condition(eventData)) {
				await unlockAchievement(eventData.userId, achievement.id, achievement.rarity);
			}
		}
	} catch (error) {
		console.error('Erreur lors de la vérification des achievements:', error);
	}
}

export async function unlockAchievement(
	userId: number,
	achievementId: number,
	rarity: number
): Promise<boolean> {
	try {
		const response = await fetch('/api/achievements/addAchievements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				idAchievement: achievementId,
				rarity
			})
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		console.log(`Achievement ${achievementId} débloqué pour l'utilisateur ${userId}`);
		return true;
	} catch (error) {
		console.error(`Erreur lors du déverrouillage de l'achievement ${achievementId}:`, error);
		return false;
	}
}
