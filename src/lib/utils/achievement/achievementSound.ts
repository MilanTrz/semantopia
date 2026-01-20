/**
 * Joue le son d'achievement selon la rareté
 * @param rarity - 0 = commun (a1), 1 = rare (a2), 2 = épique (a3)
 */
export function playMinecraftAchievementSound(rarity: number = 0) {
	try {
		const soundMap: Record<number, string> = {
			0: '/sounds/a1.mp3',
			1: '/sounds/a2.mp3',
			2: '/sounds/a3.mp3'
		};

		const soundFile = soundMap[rarity] || soundMap[0];
		const audio = new Audio(soundFile);
		audio.volume = 0.7;
		audio.play().catch((error) => {
			console.warn('Impossible de jouer le son:', error);
		});
	} catch (error) {
		console.error('Erreur lors de la lecture du son:', error);
	}
}
