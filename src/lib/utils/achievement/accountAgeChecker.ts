import type { GameEventData } from '$lib/models/achievements';

export interface UserAccountInfo {
	id: number;
	createdAt: string;
}

/**
 * Calcule l'âge du compte en millisecondes
 */
export function calculateAccountAge(createdAtString: string): number {
	try {
		const createdAt = new Date(createdAtString);
		const now = new Date();
		return now.getTime() - createdAt.getTime();
	} catch {
		return 0;
	}
}

/**
 * Récupère les informations du compte utilisateur
 */
export async function getUserAccountInfo(userId: number): Promise<UserAccountInfo | null> {
	try {
		const response = await fetch(`/api/user/${userId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return {
			id: data.id,
			createdAt: data.createdAt
		};
	} catch (error) {
		console.error('Erreur lors de la récupération des infos du compte:', error);
		return null;
	}
}

/**
 * Crée un événement de vérification de date du compte
 */
export async function createAccountAgeEvent(
	userId: number
): Promise<GameEventData> {
	const accountInfo = await getUserAccountInfo(userId);

	if (!accountInfo) {
		return {
			userId,
			type: 'none',
			accountAgeMs: 0
		};
	}

	const accountAgeMs = calculateAccountAge(accountInfo.createdAt);

	return {
		userId,
		type: 'none',
		accountAgeMs
		};
}
