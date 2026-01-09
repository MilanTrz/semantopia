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

			if ([5, 6, 7].includes(achievement.id)) {
				continue;
			}

			if (achievement.id === 12 && eventData?.konamiCode === true) {
				await unlockAchievement(eventData.userId, achievement.id);
				continue;
			}

			if (achievement.condition(eventData)) {
				await unlockAchievement(eventData.userId, achievement.id);
			}
		}

		// Badges basés sur le nombre de badges
		const badgeCount = currentUnlockedAchievements.length;
		
		// 5 badges
		if (badgeCount >= 5 && !currentUnlockedAchievements.includes(5)) {
			await unlockAchievement(eventData.userId, 5);
		}
		
		// 10 badges
		if (badgeCount >= 10 && !currentUnlockedAchievements.includes(6)) {
			await unlockAchievement(eventData.userId, 6);
		}
		
		// tous les badges (sauf 7 (lui) et 11 (créateur))
		const totalAchievementsNeeded = ACHIEVEMENTS.length - 2;
		const achievableUnlocked = currentUnlockedAchievements.filter(id => id !== 7 && id !== 11).length;
		if (achievableUnlocked >= totalAchievementsNeeded && !currentUnlockedAchievements.includes(7)) {
			await unlockAchievement(eventData.userId, 7);
		}
	} catch (error) {
		console.error('Erreur lors de la vérification des achievements:', error);
	}
}

export async function unlockAchievement(
	userId: number,
	achievementId: number
): Promise<boolean> {
	try {
		const response = await fetch('/api/achievements/addAchievements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				idAchievement: achievementId
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
