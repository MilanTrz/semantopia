import { writable } from 'svelte/store';
import type { Achievement } from '$lib/models/achievements';

export interface AchievementNotification {
	achievement: Achievement;
	id: string;
}

export const achievementNotifications = writable<AchievementNotification[]>([]);

export function addAchievementNotification(achievement: Achievement) {
	const id = `${achievement.id}-${Date.now()}`;
	const notification: AchievementNotification = { achievement, id };
	
	achievementNotifications.update(notifications => [...notifications, notification]);

	// Auto-remove après 6 secondes (durée d'affichage Minecraft)
	setTimeout(() => {
		achievementNotifications.update(notifications =>
			notifications.filter(n => n.id !== id)
		);
	}, 6000);

	return id;
}

export function removeAchievementNotification(id: string) {
	achievementNotifications.update(notifications =>
		notifications.filter(n => n.id !== id)
	);
}
